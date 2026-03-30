import inspectStore from '@/store/inspectStore';
import shelterStore from '@/store/shelterStore';
import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import InspectImageView from '../../../list/InspectImageView';
import ShelterPhotoInput from './ShelterPhotoInput';
export default function ShelterPhotoInputs() {
  const {
    locationImage,
    interiorImage,
    fireImage,
    singleImage,
    nearImage,
    farImage,
    setLocationImage,
    setInteriorImage,
    setFireImage,
    setSingleImage,
    setNearImage,
    setFarImage,
  } = shelterStore();
  const [viewerImages, setViewerImages] = useState<any>([]);
  const [index, setIndex] = useState<number>(0);
  const [viewerVisible, setViewerVisible] = useState<boolean>(false);
  const [viewerTarget, setViewerTarget] = useState<string>('');
  const { isEdit, fetchRemoveImage, fetchFiles } = inspectStore();
  const { fieldInfo } = inspectStore();
  const { files } = inspectStore();

  useEffect(() => {
    if (files) {
      // console.log('useEffect shelter files');
      setInteriorImage(files.filter((file) => file.fileType === 'interior'));
      setLocationImage(files.filter((file) => file.fileType === 'location'));
      setFireImage(files.filter((file) => file.fileType === 'fire'));
      setSingleImage(files.filter((file) => file.fileType === 'single'));
      setNearImage(files.filter((file) => file.fileType === 'near'));
      setFarImage(files.filter((file) => file.fileType === 'far'));
    }
  }, [files]);

  const handleImageRemove = (data: any, index: number, type: string) => {
    if (data.fileId) {
      removeImage(data, index, type);
    } else {
      removeInputImage(data, index, type);
    }
  };

  const removeImage = (data: any, index: number, type: string) => {
    Alert.alert('삭제', '삭제하시겠습니까?', [
      { text: '취소', onPress: () => {} },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          let fileId = '';
          if (type === 'location') {
            fileId = locationImage[index].fileId;
          } else if (type === 'interior') {
            fileId = interiorImage[index].fileId;
          } else if (type === 'fire') {
            fileId = fireImage[index].fileId;
          } else if (type === 'single') {
            fileId = singleImage[index].fileId;
          } else if (type === 'near') {
            fileId = nearImage[index].fileId;
          } else if (type === 'far') {
            fileId = farImage[index].fileId;
          }
          await fetchRemoveImage(fileId);
          await fetchFiles(fieldInfo?.pnu);
        },
      },
    ]);
  };

  const removeInputImage = (data: any, index: number, type: string) => {
    if (type === 'location') {
      setLocationImage(locationImage.filter((_, i) => i !== index));
    } else if (type === 'interior') {
      setInteriorImage(interiorImage.filter((_, i) => i !== index));
    } else if (type === 'fire') {
      setFireImage(fireImage.filter((_, i) => i !== index));
    } else if (type === 'single') {
      setSingleImage(singleImage.filter((_, i) => i !== index));
    } else if (type === 'near') {
      setNearImage(nearImage.filter((_, i) => i !== index));
    } else if (type === 'far') {
      setFarImage(farImage.filter((_, i) => i !== index));
    }
  };
  const handleSelectImage = (uri: string, type: string) => {
    if (type === 'location') {
      setLocationImage([
        ...locationImage,
        { fileType: 'location', uri: uri, isNew: true },
      ]);
    } else if (type === 'interior') {
      setInteriorImage([
        ...interiorImage,
        { fileType: 'interior', uri: uri, isNew: true },
      ]);
    } else if (type === 'fire') {
      setFireImage([...fireImage, { fileType: 'fire', uri: uri, isNew: true }]);
    } else if (type === 'single') {
      setSingleImage([
        ...singleImage,
        { fileType: 'single', uri: uri, isNew: true },
      ]);
    } else if (type === 'near') {
      setNearImage([...nearImage, { fileType: 'near', uri: uri, isNew: true }]);
    } else if (type === 'far') {
      setFarImage([...farImage, { fileType: 'far', uri: uri, isNew: true }]);
    }
  };

  return (
    <>
      <ShelterPhotoInput
        title="위치도"
        data={locationImage}
        onPressImage={(uri, index) => {
          setIndex(index);
          setViewerImages(locationImage);
          setViewerTarget('location');
          setViewerVisible(true);
        }}
        onRemoveImage={(data, index) =>
          handleImageRemove(data, index, 'location')
        }
        onSelectImage={(uri) => handleSelectImage(uri, 'location')}
      />
      <ShelterPhotoInput
        title="내부"
        data={interiorImage}
        onPressImage={(uri, index) => {
          setIndex(index);
          setViewerImages(interiorImage);
          setViewerTarget('interior');
          setViewerVisible(true);
        }}
        onRemoveImage={(data, index) =>
          handleImageRemove(data, index, 'interior')
        }
        onSelectImage={(uri) => handleSelectImage(uri, 'interior')}
      />
      <ShelterPhotoInput
        title="소화기"
        data={fireImage}
        onPressImage={(uri, index) => {
          setIndex(index);
          setViewerImages(fireImage);
          setViewerTarget('fire');
          setViewerVisible(true);
        }}
        onRemoveImage={(data, index) => handleImageRemove(data, index, 'fire')}
        onSelectImage={(uri) => handleSelectImage(uri, 'fire')}
      />
      <ShelterPhotoInput
        title="단독"
        data={singleImage}
        onPressImage={(uri, index) => {
          setIndex(index);
          setViewerImages(singleImage);
          setViewerTarget('single');
          setViewerVisible(true);
        }}
        onRemoveImage={(data, index) =>
          handleImageRemove(data, index, 'single')
        }
        onSelectImage={(uri) => handleSelectImage(uri, 'single')}
      />
      <ShelterPhotoInput
        title="근경"
        data={nearImage}
        onPressImage={(uri, index) => {
          setIndex(index);
          setViewerImages(nearImage);
          setViewerTarget('near');
          setViewerVisible(true);
        }}
        onRemoveImage={(data, index) => handleImageRemove(data, index, 'near')}
        onSelectImage={(uri) => handleSelectImage(uri, 'near')}
      />
      <ShelterPhotoInput
        title="원경"
        data={farImage}
        onPressImage={(uri, index) => {
          setIndex(index);
          setViewerImages(farImage);
          setViewerTarget('far');
          setViewerVisible(true);
        }}
        onRemoveImage={(data, index) => handleImageRemove(data, index, 'far')}
        onSelectImage={(uri) => handleSelectImage(uri, 'far')}
      />
      {viewerVisible && (
        <InspectImageView
          data={viewerImages}
          isVisible={viewerVisible}
          setIsVisible={(visible) => {
            if (!visible) {
              setViewerImages([]);
              setIndex(0);
              setViewerTarget('');
              setViewerVisible(false);
            }
          }}
          index={index}
          onRemove={(data, index) => {
            handleImageRemove(data, index, viewerTarget);
            setIndex(0);
            setViewerTarget('');
            setViewerVisible(false);
          }}
        />
      )}
    </>
  );
}
