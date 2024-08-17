import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useAppContext } from '../context/AppContext';
import ServiceInput from '../components/ServiceInput';

const { width, height } = Dimensions.get('window');

const OrderEntryScreen = ({ navigation }) => {
  const { addOrder, services, currency, loading } = useAppContext();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerLocation, setCustomerLocation] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [total, setTotal] = useState(0);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={styles.addButton} onPress={handleAddOrder}>
          <Ionicons name="add-circle" size={20} color="white" />
          <Text style={styles.buttonText}>إضافة طلب</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, handleAddOrder, customerLocation, customerName, customerPhone, selectedServices, total]);

  const resetForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setSelectedServices([]);
    setCustomerLocation('');
  };
  
  const handleAddOrder = () => {
    if (!customerName || !customerPhone || !customerLocation || selectedServices.length === 0) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول');
      return;
    }

    if (customerPhone.length !== 10 || !/^\d+$/.test(customerPhone)) {
      Alert.alert('خطأ', 'يجب أن يكون رقم الهاتف 10 أرقام بالضبط');
      return;
    }
    
    if (!total) {
      Alert.alert('خطأ', 'تحقق من كميات الخدمات');
      return;
    }

    const newOrder = {
      name: customerName,
      phone: customerPhone,
      location: customerLocation,
      services: selectedServices,
      status: 'جديد',
      orderDate: new Date().toISOString(),
    };

    addOrder(newOrder)
      .then(() => {
        Alert.alert('نجاح', 'تمت إضافة الطلب بنجاح');
        resetForm();
        navigation.navigate('OrderList', { refresh: true });
      })
      .catch((error) => {
        Alert.alert('خطأ', 'فشل في إضافة الطلب');
        console.error(error);
      });
  };

  const isDecimal = (value) => /^\d+(\.\d{1,2})?$/.test(value);

  const calculateTotal = () => {
    let globalTotal = 0;

    Object.keys(selectedServices).map((index) => {
      const serviceDetail = selectedServices[index];
      const key = serviceDetail.id;

      let total = 0;

      if (services[key].type === 'perSquareMeter') {
        const length = serviceDetail?.length;
        const width = serviceDetail?.width;
        if (isDecimal(length) && isDecimal(width)) {
          total = Number(length) * Number(width) * Number(services[key].price);
        } else {
          total = NaN;
        }
      } else {
        if (isDecimal(serviceDetail.quantity)) {
          total = Number(serviceDetail.quantity) * Number(services[key].price);
        } else {
          total = NaN;
        }
      }
      globalTotal += total;
    });
    return globalTotal;
  };

  useEffect(() => {
    setTotal(calculateTotal());
  }, [selectedServices]);

  const handleServiceChange = (index, value) => {
    const changed = selectedServices.map((selectedService, ind) => {
      if (ind === index) {
        return value;
      }
      return selectedService;
    });

    setSelectedServices(changed);
  };

  const handleServiceDelete = (index) => {
    const deletedServices = selectedServices.filter((service, ind) => ind !== index);
    setSelectedServices(deletedServices);
  };

  const handleServiceSelect = (serviceId) => {
    if (serviceId) {
      const selectedService = services[serviceId];
      if (selectedService.type === 'perSquareMeter') {
        setSelectedServices((prevDetails) => [
          ...prevDetails,
          { id: serviceId, length: 1, width: 1 },
        ]);
      } else {
        setSelectedServices((prevDetails) => [
          ...prevDetails,
          { id: serviceId, quantity: 1 },
        ]);
      }
    }
  };
  if(loading){
    return <ActivityIndicator size="large" color="#0000ff" />;
  }
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>اسم العميل</Text>
      <TextInput
        style={styles.input}
        value={customerName}
        onChangeText={setCustomerName}
        placeholder="أدخل اسم العميل"
      />

      <Text style={styles.label}>هاتف العميل</Text>
      <TextInput
        style={styles.input}
        value={customerPhone}
        onChangeText={setCustomerPhone}
        placeholder="أدخل هاتف العميل"
        keyboardType="number-pad"
        maxLength={10}
      />

      <Text style={styles.label}>موقع العميل</Text>
      <TextInput
        style={styles.input}
        value={customerLocation}
        placeholder="سيتم تحديد الموقع الحالي"
        onChangeText={setCustomerLocation}
      />

      <Text style={styles.label}>الخدمات</Text>
      <RNPickerSelect
        onValueChange={handleServiceSelect}
        items={Object.keys(services).map((key) => ({
          label: services[key].name,
          value: key,
        }))}
        style={pickerSelectStyles}
        value={null}
        placeholder={{
          label: 'اختر خدمة...',
          value: null,
        }}
      />

      {selectedServices.map((item, index) => (
        <ServiceInput
          key={index + '/' + item.id}
          index={index}
          service={services[item.id]}
          serviceDetail={selectedServices[index]}
          onServiceDetailChange={(object) => handleServiceChange(index, object)}
          onDelete={() => handleServiceDelete(index)}
        />
      ))}

      <Text style={styles.totalLabel}>
        المجموع: {isNaN(total) ? 'إدخال غير صالح' : `${total.toFixed(0)} ${currency}`}
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#32cd32',
    borderRadius: 8,
    padding: 8,
    marginRight: 10,
  },
  buttonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 30,
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
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
    marginBottom: 16,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
    marginBottom: 16,
  },
});

export default OrderEntryScreen;
