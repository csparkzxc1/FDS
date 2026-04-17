import * as Location from 'expo-location';
import { useEffect, useState, type ReactElement } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { api, ApiError, type AttendanceRecord, type OrganizationSummary } from '../api/client';
import { useAuth } from '../stores/auth';
import { t } from '../i18n';

export function HomeScreen(): ReactElement {
  const token = useAuth((s) => s.accessToken)!;
  const clear = useAuth((s) => s.clear);
  const activeOrgId = useAuth((s) => s.activeOrgId);
  const setActiveOrg = useAuth((s) => s.setActiveOrg);

  const [orgs, setOrgs] = useState<OrganizationSummary[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  async function loadOrgs() {
    try {
      const res = await api.organizations(token);
      setOrgs(res);
      if (!activeOrgId && res.length > 0) setActiveOrg(res[0].id);
    } catch (err) {
      Alert.alert('Error', err instanceof ApiError ? err.message : String(err));
    }
  }

  async function loadAttendances(orgId: string) {
    setLoading(true);
    try {
      setRecords(await api.attendances(token, orgId));
    } catch (err) {
      Alert.alert('Error', err instanceof ApiError ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOrgs();
  }, []);
  useEffect(() => {
    if (activeOrgId) void loadAttendances(activeOrgId);
  }, [activeOrgId]);

  const openRecord = records.find((r) => r.status === 'open') ?? null;

  async function checkIn() {
    if (!activeOrgId) return;
    setBusy(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert(t('check.in'), 'Location permission denied');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      await api.checkIn(token, activeOrgId, {
        method: 'gps',
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
      await loadAttendances(activeOrgId);
    } catch (err) {
      Alert.alert(t('check.in'), err instanceof ApiError ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function checkOut() {
    if (!activeOrgId || !openRecord) return;
    setBusy(true);
    try {
      await api.checkOut(token, activeOrgId, { attendanceId: openRecord.id });
      await loadAttendances(activeOrgId);
    } catch (err) {
      Alert.alert(t('check.out'), err instanceof ApiError ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  const activeOrg = orgs.find((o) => o.id === activeOrgId);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.orgName}>{activeOrg?.name ?? '…'}</Text>
        <Pressable onPress={clear}>
          <Text style={styles.signOut}>Sign out</Text>
        </Pressable>
      </View>

      <Pressable
        style={[styles.action, openRecord ? styles.actionOut : styles.actionIn]}
        onPress={openRecord ? checkOut : checkIn}
        disabled={busy || !activeOrgId}
      >
        {busy ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.actionText}>{openRecord ? t('check.out') : t('check.in')}</Text>
        )}
      </Pressable>

      <Text style={styles.sectionTitle}>Recent</Text>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={records}
          keyExtractor={(r) => r.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.rowTime}>{new Date(item.checkInAt).toLocaleString()}</Text>
              <Text style={styles.rowMeta}>
                {item.method} · {item.status}
                {item.workMinutes !== null ? ` · ${item.workMinutes}m` : ''}
              </Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No records yet</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa', padding: 24, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  orgName: { fontSize: 22, fontWeight: '700' },
  signOut: { color: '#525252', fontSize: 14 },
  action: { padding: 32, borderRadius: 20, alignItems: 'center', marginBottom: 32 },
  actionIn: { backgroundColor: '#171717' },
  actionOut: { backgroundColor: '#b91c1c' },
  actionText: { color: 'white', fontSize: 22, fontWeight: '700' },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#525252', marginBottom: 8 },
  row: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#e5e5e5' },
  rowTime: { fontSize: 14 },
  rowMeta: { fontSize: 12, color: '#737373', marginTop: 2 },
  empty: { color: '#737373', textAlign: 'center', paddingVertical: 24 },
});
