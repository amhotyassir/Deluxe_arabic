import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';
import * as ImagePicker from 'expo-image-picker';
import { useAppContext } from '../context/AppContext';

const { width } = Dimensions.get('window');

const ManageServices = () => {
  const { services, addService, updateService, removeService , currency } = useAppContext();
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [pricingType, setPricingType] = useState('perPiece');
  const [serviceImage, setServiceImage] = useState(null);
  const [editPrices, setEditPrices] = useState({});
  const [editNames, setEditNames] = useState({});
  const [editServiceImages, setEditServiceImages] = useState({});

  if (!services) {
    return <ActivityIndicator />;
  }

  const isDecimal = (value) => /^\d+(\.\d{1,2})?$/.test(value);

  const handleAddService = async () => {
    if (!serviceName || !servicePrice || !pricingType) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول');
      return;
    }
    if (!isDecimal(servicePrice)) {
      Alert.alert('خطأ', 'يجب أن يكون السعر قيمة عشرية');
      return;
    }
    await addService(serviceName, servicePrice, pricingType, serviceImage);
    setServiceName('');
    setServicePrice('');
    setPricingType('perPiece');
    setServiceImage(null);
  };

  const handleUpdateService = async (serviceId, serviceData) => {
    if (serviceData.price && !isDecimal(serviceData.price)) {
      Alert.alert('خطأ', 'يجب أن يكون السعر قيمة عشرية');
      setEditPrices((prevEditPrices) => ({ ...prevEditPrices, [serviceId]: services[serviceId].price }));
      setEditNames((prevEditNames) => ({ ...prevEditNames, [serviceId]: services[serviceId].name }));
      return;
    }
    if (!serviceData.name) {
      Alert.alert('خطأ', 'لا يمكن أن يكون اسم الخدمة فارغًا');
      setEditNames((prevEditNames) => ({ ...prevEditNames, [serviceId]: services[serviceId].name }));
      return;
    }
    if (!serviceData.price) {
        Alert.alert('خطأ', 'لا يمكن أن يكون سعر الخدمة فارغًا');
        setEditPrices((prevEditPrices) => ({ ...prevEditPrices, [serviceId]: services[serviceId].price }));
        return;
    }
    await updateService(serviceId, serviceData, editServiceImages[serviceId]);
    setEditServiceImages((prevEditServiceImages) => ({ ...prevEditServiceImages, [serviceId]: null }));
    setEditNames((prevEditNames) => ({ ...prevEditNames, [serviceId]: undefined }));
    setEditPrices((prevEditPrices) => ({ ...prevEditPrices, [serviceId]: undefined }));
    Alert.alert('نجاح', 'تم تحديث الخدمة بنجاح');
  };

  const handleRemoveService = (serviceId) => {
    Alert.alert(
      "تأكيد الحذف",
      "هل أنت متأكد من أنك تريد حذف هذه الخدمة؟",
      [
        {
          text: "إلغاء",
          style: "cancel"
        },
        {
          text: "موافق",
          onPress: () => removeService(serviceId)
        }
      ],
      { cancelable: false }
    );
  };

  const pickImage = async (serviceId = null) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      if (serviceId) {
        setEditServiceImages((prevEditServiceImages) => ({ ...prevEditServiceImages, [serviceId]: imageUri }));
      } else {
        setServiceImage(imageUri);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>إدارة الخدمات</Text>
      <View style={styles.addServiceContainer}>
        <TextInput
          style={styles.input}
          value={serviceName}
          onChangeText={setServiceName}
          placeholder="اسم الخدمة"
        />
        <View style={styles.pickerContainer}>
          <View>
            <View style={styles.servicePriceContainer}>
              <TextInput
                style={styles.servicePriceInput}
                value={servicePrice}
                onChangeText={setServicePrice}
                placeholder="السعر"
                keyboardType="number-pad"
                maxLength={6}
              />
              <Text style={styles.currency}>{currency}</Text>
            </View>
          </View>
          <View style={styles.pickerWrapper}>
            <RNPickerSelect
              onValueChange={(value) => setPricingType(value)}
              items={[
                { label: 'لكل قطعة', value: 'perPiece' },
                { label: 'لكل متر مربع (م²)', value: 'perSquareMeter' },
              ]}
              style={pickerSelectStyles}
              value={pricingType}
              placeholder={{}}
              useNativeAndroidPickerStyle={false}
              Icon={() => null}
            />
          </View>
        </View>
        {serviceImage && <Image source={{ uri: serviceImage }} style={styles.serviceImage} />}
        <TouchableOpacity
          style={styles.imagePickerButton}
          onPress={() => pickImage()}
        >
          <Ionicons name="image" size={20} color="white" />
          <Text style={styles.buttonText}>اختر صورة</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={handleAddService}
        >
          <Ionicons name="add-circle" size={20} color="white" />
          <Text style={styles.buttonText}>إضافة خدمة</Text>
        </TouchableOpacity>
      </View>

      {Object.keys(services).map((serviceId) => (
        <View key={serviceId} style={styles.serviceItem}>
          <View style={styles.serviceRow}>
            <TextInput
              style={styles.serviceName}
              value={editNames[serviceId] !== undefined ? editNames[serviceId] : services[serviceId].name}
              onChangeText={(name) => setEditNames((prevEditNames) => ({ ...prevEditNames, [serviceId]: name }))}
            />
            <TextInput
              style={styles.servicePrice}
              value={editPrices[serviceId] !== undefined ? editPrices[serviceId] : String(services[serviceId].price)}
              onChangeText={(price) => setEditPrices((prevEditPrices) => ({ ...prevEditPrices, [serviceId]: price }))}
              keyboardType="number-pad"
              maxLength={6}
            />
            <TouchableOpacity
              style={styles.saveButton}
              disabled={!(editNames[serviceId] || editPrices[serviceId] || editServiceImages[serviceId] )}
              onPress={() => handleUpdateService(serviceId, { ...services[serviceId], name: editNames[serviceId] || services[serviceId].name, price: editPrices[serviceId] || services[serviceId].price, imageUri: editServiceImages[serviceId] || services[serviceId].imageUrl })}
            >
              <Ionicons name="checkmark-circle" size={20} color={(editNames[serviceId] || editPrices[serviceId] || editServiceImages[serviceId] )? 'green': 'lightgray'}  />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButton}
              disabled={!(editNames[serviceId] || editPrices[serviceId] || editServiceImages[serviceId] )}
              onPress={() => {
                setEditPrices((prevEditPrices) => ({ ...prevEditPrices, [serviceId]: undefined }));
                setEditNames((prevEditNames) => ({ ...prevEditNames, [serviceId]: undefined }));
                setEditServiceImages((prevEditImages) => ({ ...prevEditImages, [serviceId]: undefined }));
              }}
            >
              <Ionicons name="close-sharp" size={20} color={(editNames[serviceId] || editPrices[serviceId] || editServiceImages[serviceId] )? 'red': 'lightgray'}  />
            </TouchableOpacity>

            <TouchableOpacity style={[{padding: (editServiceImages[serviceId] ||services[serviceId].imageUrl ) ? 0 : 10 }, styles.miniImagePickerButton]} onPress={() => pickImage(serviceId)}>
                {editServiceImages[serviceId] ||services[serviceId].imageUrl ? (editServiceImages[serviceId] ?  <Image source={{ uri: editServiceImages[serviceId] }} style={styles.miniServiceImage} />:services[serviceId].imageUrl && <Image source={{ uri: services[serviceId].imageUrl }} style={styles.miniServiceImage} />) : <Ionicons name="image" size={20} color="white" />}
              
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleRemoveService(serviceId)}>
              <Ionicons name="trash" size={20} color="white" />
            </TouchableOpacity>
          </View>
          
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  addServiceContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#32cd32',
    borderRadius: 8,
    padding: 16,
    margin:10
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  serviceItem: {
    marginBottom: 16,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceName: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    width: '40%',
  },
  servicePriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  servicePriceInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    width: 80,
  },
  servicePrice: {
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 7,
    width: 50,
  },
  currency: {
    marginLeft: 8,
    fontSize: 16,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    width:'100%',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    backgroundColor: 'lightgray',
    width:'50%'
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'red',
    padding:10,
    borderRadius:8,
    marginRight:7
  },
  saveButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding:0,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 10,
    margin:10,
  },
  miniImagePickerButton:{
    
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
  miniServiceImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignSelf: 'center',
  },
  serviceImage: {
    width: width*0.5,
    height: width*0.5,
    borderRadius: 8,
    margin: 16,
    alignSelf: 'center',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    flex:1,
    color: 'black',
    alignSelf: 'center',
    textAlign:'left',
    width:'100%',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    flex:1,
    alignSelf: 'center',
    color: 'black',
    alignSelf: 'center',
    width:'100%'
  },
  iconContainer: {
    top: 10,
    right: 12,
  },
  viewContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    color: 'black',
    fontSize: 16,
    textAlign:'left',
  },
});

export default ManageServices;
