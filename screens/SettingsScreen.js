import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import ManageServices from '../components/ManageServices';
import ArchiveSection from '../components/ArchiveSection';
import { useAppContext } from '../context/AppContext';

const SettingsScreen = () => {
  const {loading} = useAppContext()

  if (loading){
    return <ActivityIndicator size="large" color="#0000ff" />;
  }
  return (
    
    <ScrollView style={styles.container}>
      <ManageServices />
      <ArchiveSection />
      {/* يمكن إضافة المزيد من الأقسام هنا حسب الحاجة */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
});

export default SettingsScreen;
