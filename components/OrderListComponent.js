import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Linking, Modal, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from 'react-native-vector-icons';
import { useAppContext } from '../context/AppContext';

const { width, height } = Dimensions.get('window');
const itemWidth = width * 0.9;

const OrderListComponent = ({
  item,
  index,
  expandedOrders,
  toggleExpandOrder,
  handleStatusChange,
  handleDeleteOrder,
  formatDateTime,
  getStatusColor,
  getNextStatusColor,
  getNextStatus,
}) => {
  const { services, currency , loading} = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState('');
  
  if (loading) {
    return <ActivityIndicator />;
  }

  const renderServicesTable = (order_services) => {
    let grandTotal = 0;
    const detailedServices = order_services.map((order_service, index) => {
      const key = order_service.id;
      const service = services[key];

      const total = service.type === 'perSquareMeter'
        ? Number(order_service.length) * Number(order_service.width) * Number(service.price)
        : Number(order_service.quantity) * Number(service.price);

      grandTotal += total;

      return (
        <View key={index + '/' + key} style={styles.serviceRow}>
          <Text style={styles.serviceCell}>{service.name}</Text>
          <Text
            onPress={() => {
              if (order_service.imageUrl) {
                setShowModal(true);
                setModalImage(order_service.imageUrl);
              }
            }}
            style={[styles.serviceCell, order_service.imageUrl ? styles.link : {}]}
          >
            {service.type === 'perSquareMeter'
              ? `${order_service.length} x ${order_service.width} م²`
              : `${order_service.quantity} قطع`}
          </Text>
          <Text style={styles.serviceCell}>{total.toFixed(0)} {currency}</Text>
        </View>
      );
    });

    return (
      <View>
        {detailedServices}
        <Text style={styles.totalLabel}>{grandTotal} {currency}</Text>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.customerItem,
        {
          borderRightColor: getStatusColor(item.status),
          backgroundColor: expandedOrders[item.id] ? '#f2f2f2' : '#fff',
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.customerName}>
          {index + 1}. {item.name.length > 10 ? `${item.name.substring(0, 8)}...` : item.name}
        </Text>
        <View style={styles.headerLeft}>
          <Text style={[styles.status, { backgroundColor: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
          <TouchableOpacity onPress={() => toggleExpandOrder(item.id, index)}>
            <Ionicons name={expandedOrders[item.id] ? 'chevron-up' : 'chevron-down'} size={24} color="blue" />
          </TouchableOpacity>
        </View>
      </View>
      {expandedOrders[item.id] && (
        <View style={styles.details}>
          <View style={styles.row}>
            <Text style={styles.label}>الاسم الكامل:</Text>
            <Text style={styles.value}>{item.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>الهاتف:</Text>
            <Text onPress={() => Linking.openURL(`tel:${item.phone}`)} style={[styles.value, styles.link]}>
              {item.phone}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>الموقع:</Text>
            <Text style={styles.value}>{item.location}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>تاريخ الطلب:</Text>
            <Text style={styles.value}>{formatDateTime(item.orderDate)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>الحالة:</Text>
            <Text style={styles.value}>{item.status}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>الخدمات:</Text>
          </View>
          <View style={styles.serviceTable}>
            {renderServicesTable(item.services)}
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#FF0000', marginRight: 8 }]}
              onPress={() => handleDeleteOrder(item.id)}
            >
              <Ionicons name="trash" size={20} color="white" />
              <Text style={styles.buttonText}>حذف</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: getNextStatusColor(item.status) }]}
              onPress={() => handleStatusChange(item.id, item.status)}
            >
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text style={styles.buttonText}>
                {item.status === 'جاهز' ? 'تم التسليم' : getNextStatus(item.status)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Image source={{ uri: modalImage }} style={styles.serviceImage} />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowModal(!showModal)}
            >
              <Ionicons name="close-circle" size={24} color="white" />
              <Text style={styles.buttonText}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  customerItem: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    borderRightWidth: 5,
    width: itemWidth,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  customerName: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  status: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  details: {
    marginTop: 8,
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontWeight: 'bold',
    width: '40%',
    textAlign: 'right',
  },
  value: {
    width: '60%',
    textAlign: 'center',
  },
  link: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  actions: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  button: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 8,
  },
  buttonText: {
    color: 'white',
    marginRight: 8,
  },
  serviceTable: {
    flex: 1,
    marginBottom: 15,
  },
  serviceRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  serviceCell: {
    width: '33%',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  serviceHeader: {
    fontWeight: 'bold',
    width: '33%',
    textAlign: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
  },
  serviceImage: {
    width: width * 0.8,
    height: width * 0.8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: width * 0.8,
    height: width * 0.8 + 100,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    marginRight: 8,
    fontSize: 16,
  },
});

export default OrderListComponent;
