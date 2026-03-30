import MapLibreGL from '@maplibre/maplibre-react-native';
import React, { memo, useEffect, useState } from 'react';

const WFSSource = memo(({ l, options, mapZoom, mapBbox }: any) => {
  const [shape, setShape] = useState<any>(null);

  useEffect(() => {
    if (!options[l.id] || mapZoom < l.minZoom || !mapBbox) {
      setShape(null);
      return;
    }

    const lng2x = (lng: number) => (lng * 20037508.34) / 180;
    const lat2y = (lat: number) =>
      ((Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180)) *
        20037508.34) /
      180;

    const x2lng = (x: number) => (x * 180) / 20037508.34;
    const y2lat = (y: number) =>
      (Math.atan(Math.sinh(y / (20037508.34 / Math.PI))) * 180) / Math.PI;

    const [minLng, minLat, maxLng, maxLat] = mapBbox;
    const minX = lng2x(minLng);
    const minY = lat2y(minLat);
    const maxX = lng2x(maxLng);
    const maxY = lat2y(maxLat);

    const proxyUrl = `https://farmfield.kr/proxy.jsp`;
    const cql = `BBOX(geom, ${minX}, ${minY}, ${maxX}, ${maxY}, 'EPSG:3857')`;
    const wfsParams = `service=WFS&version=1.1.0&request=GetFeature&typeName=${l.layer}&outputFormat=application/json&srsname=EPSG:3857&cql_filter=${encodeURIComponent(cql)}`;
    const postBody = `url=${encodeURIComponent('http://112.218.160.197:1607/geoserver/wfs')}&${wfsParams}`;

    fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: postBody,
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text.substring(0, 100)}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.features) {
          data.features.forEach((f: any) => {
            if (f.geometry && f.geometry.coordinates) {
              const transformCoords = (coords: any): any => {
                if (typeof coords[0] === 'number') {
                  return [x2lng(coords[0]), y2lat(coords[1])];
                }
                if (Array.isArray(coords)) {
                  return coords.map(transformCoords);
                }
                return coords;
              };
              f.geometry.coordinates = transformCoords(f.geometry.coordinates);
            }
          });
          setShape(data);
        }
      })
      .catch((err) => {
        console.error(
          `[WFS_FETCH_ERR] ${l.id}: ${err.message || 'Unknown error'}`
        );
        setShape(null);
      });
  }, [l.id, l.layer, l.minZoom, options, mapZoom, mapBbox]);

  if (!shape) return null;

  return (
    <MapLibreGL.ShapeSource id={`${l.id}_v_source_final`} shape={shape}>
      <MapLibreGL.LineLayer
        id={`${l.id}_v_line`}
        style={{
          lineColor: l.id === 'inspect25' ? '#e03131' : '#339af0',
          lineWidth: 2,
          lineDasharray: [3, 2],
          lineOpacity: 0.8,
        }}
        minZoomLevel={l.minZoom}
      />
    </MapLibreGL.ShapeSource>
  );
});

export const GeoserverWFSLayers = memo(
  ({
    options,
    mapZoom,
    mapBbox,
  }: {
    options: any;
    mapZoom: number;
    mapBbox: [number, number, number, number] | null;
  }) => {
    const geoserverLayers = [
      { id: 'farmMap', layer: 'ekrgis:t_clfm_frm_map', minZoom: 12 },
      { id: 'inspect25', layer: 'ekrgis:v_fml_lot_inspect', minZoom: 14 },
      { id: 'use25', layer: 'ekrgis:v_fml_lot_use', minZoom: 14 },
      {
        id: 'unregistered25',
        layer: 'ekrgis:unregistered_parcel_2025',
        minZoom: 14,
      },
      { id: 'fieldMap25', layer: 'ekrgis:v_fml_lot', minZoom: 14 },
      { id: 'sgg', layer: 'ekrgis:sgg_bjd', minZoom: 7 },
      { id: 'shelter25', layer: 'ekrgis:facility_shelter', minZoom: 14 },
    ];

    return (
      <>
        {geoserverLayers.map((l) => (
          <WFSSource
            key={l.id}
            l={l}
            options={options}
            mapZoom={mapZoom}
            mapBbox={mapBbox}
          />
        ))}
      </>
    );
  }
);

export const GeoserverWMSLayers = memo(
  ({
    options,
    triggerLayerReload,
  }: {
    options: any;
    triggerLayerReload: number;
  }) => {
    const geoserverLayers = [
      { id: 'farmMap', layer: 'ekrgis:t_clfm_frm_map', minZoom: 12 },
      { id: 'inspect25', layer: 'ekrgis:v_fml_lot_inspect', minZoom: 14 },
      { id: 'use25', layer: 'ekrgis:v_fml_lot_use', minZoom: 14 },
      {
        id: 'unregistered25',
        layer: 'ekrgis:unregistered_parcel_2025',
        minZoom: 14,
      },
      { id: 'fieldMap25', layer: 'ekrgis:v_fml_lot', minZoom: 14 },
      { id: 'lxMap', layer: 'ekrgis:v_fml_lot', minZoom: 14 },
      { id: 'sgg', layer: 'ekrgis:sgg_bjd', minZoom: 7 },
      { id: 'shelter25', layer: 'ekrgis:facility_shelter', minZoom: 14 },
    ];

    return (
      <>
        {geoserverLayers.map(
          (l) =>
            options[l.id] && (
              <MapLibreGL.RasterSource
                key={l.id}
                id={`${l.id}_source`}
                tileUrlTemplates={[
                  `https://farmfield.kr/proxy.jsp?url=http://112.218.160.197:1607/geoserver/wms&service=WMS&version=1.1.1&request=GetMap&layers=${l.layer}&bbox={bbox-epsg-3857}&width=256&height=256&srs=EPSG:3857&format=image/png&transparent=true&_t=${triggerLayerReload}`,
                ]}
                tileSize={256}
              >
                <MapLibreGL.RasterLayer
                  id={`${l.id}_layer`}
                  sourceID={`${l.id}_source`}
                  style={{ rasterOpacity: 0.7 }}
                  minZoomLevel={l.minZoom}
                />
              </MapLibreGL.RasterSource>
            )
        )}
      </>
    );
  }
);
