import React, { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import EmptyState from '../../components/EmptyState';
import SectionHeader from '../../components/SectionHeader';
import { useApp } from '../../context/AppContext';
import { Nav, TabParamList } from '../../navigation/types';

// Screen 2 (Member 1): My Groups
export default function MyGroupsScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<TabParamList, 'Groups'>>();
  const { myGroups, createGroup, joinGroup } = useApp();

  const [mode, setMode] = useState<'none' | 'create' | 'join'>('none');
  const [groupName, setGroupName] = useState('');
  const [memberNames, setMemberNames] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (route.params?.mode) {
      setMode(route.params.mode);
      setError('');
    }
  }, [route.params]);

  const handleCreate = () => {
    if (!groupName.trim()) {
      setError('Give your group a name first, like "Dahab Trip".');
      return;
    }
    const group = createGroup(groupName, memberNames.split(','));
    setGroupName('');
    setMemberNames('');
    setError('');
    setMode('none');
    Alert.alert('Group created 🎉', `${group.name} is live. Send your friends this code: ${group.inviteCode}`, [
      { text: 'Open group', onPress: () => navigation.navigate('GroupDetails', { groupId: group.id }) },
    ]);
  };

  const handleJoin = () => {
    const result = joinGroup(code);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setCode('');
    setError('');
    setMode('none');
    Alert.alert('Joined 🙌', result.message);
  };

  return (
    <Screen>
      <View className="flex-row">
        <Button className="mr-2 flex-1" title="✨ Create group" onPress={() => { setMode('create'); setError(''); }} />
        <Button className="ml-2 flex-1" variant="outline" title="🔑 Join with code" onPress={() => { setMode('join'); setError(''); }} />
      </View>

      {mode === 'create' ? (
        <Card className="mt-4">
          <Text className="mb-3 text-base font-bold text-ink">Start a new group ✨</Text>
          <Input label="Group name" value={groupName} onChangeText={setGroupName} placeholder="e.g. Dahab weekend 🏄" />
          <Input
            label="Other members (optional)"
            value={memberNames}
            onChangeText={setMemberNames}
            placeholder="Separate names with commas"
            hint="You are added automatically. Friends can also join later with your invitation code."
          />
          {error ? <Text accessibilityRole="alert" className="mb-3 text-sm font-medium text-danger">{error}</Text> : null}
          <Button title="Create it" onPress={handleCreate} />
        </Card>
      ) : null}

      {mode === 'join' ? (
        <Card className="mt-4">
          <Text className="mb-3 text-base font-bold text-ink">Got a code? Jump in 🔑</Text>
          <Input label="Invitation code" value={code} onChangeText={setCode} placeholder="e.g. SIWA26" autoCapitalize="characters" />
          {error ? <Text accessibilityRole="alert" className="mb-3 text-sm font-medium text-danger">{error}</Text> : null}
          <Button title="Join group" onPress={handleJoin} />
        </Card>
      ) : null}

      <SectionHeader title={`Your groups (${myGroups.length})`} />
      {myGroups.length === 0 ? (
        <EmptyState emoji="👯" title="No groups yet" message="Create one for your flat, your trip, or your study squad." />
      ) : (
        myGroups.map((g) => (
          <Card key={g.id} onPress={() => navigation.navigate('GroupDetails', { groupId: g.id })}>
            <Text className="text-base font-bold text-ink">{g.name}</Text>
            <Text className="mt-1 text-xs text-muted">{g.memberIds.length} members</Text>
          </Card>
        ))
      )}
    </Screen>
  );
}
