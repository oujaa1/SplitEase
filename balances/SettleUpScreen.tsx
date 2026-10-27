import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import Input from '../../components/Input';
import EmptyState from '../../components/EmptyState';
import { useApp } from '../../context/AppContext';
import { RootStackParamList } from '../../navigation/types';
import { groupDebts } from '../../utils/balances';
import { formatEGP, parseEGP, piastresToText } from '../../utils/money';

type Props = NativeStackScreenProps<RootStackParamList, 'SettleUp'>;

export default function SettleUpScreen({ route, navigation }: Props) {
  const { myGroups, currentUserId, expenses, settlements, userName, addSettlement } = useApp();

  const [groupId, setGroupId] = useState(route.params?.groupId ?? myGroups[0]?.id ?? '');
  const [fromId, setFromId] = useState(route.params?.fromUserId ?? currentUserId);
  const [toId, setToId] = useState(route.params?.toUserId ?? '');
  const [amountText, setAmountText] = useState('');
  const [error, setError] = useState('');

  const group = myGroups.find((g) => g.id === groupId);

  if (myGroups.length === 0 || !group) {
    return (
      <Screen>
        <EmptyState emoji="👯" title="No groups yet" message="Join or create a group before recording a repayment." />
      </Screen>
    );
  }

  const outstanding =
    groupDebts(group.id, expenses, settlements).find((d) => d.from === fromId && d.to === toId)?.amountPiastres ?? 0;

  const pickGroup = (id: string) => {
    const next = myGroups.find((g) => g.id === id);
    if (!next) return;
    setGroupId(id);
    setFromId(next.memberIds.includes(currentUserId) ? currentUserId : next.memberIds[0]);
    setToId('');
    setError('');
  };

  const handleSave = () => {
    const amount = parseEGP(amountText);
    if (!toId) return setError('Pick who is getting paid back.');
    if (fromId === toId) return setError('The payer and the receiver need to be two different people.');
    if (amount === null || amount <= 0) return setError('That amount does not look right. Use a positive number in EGP, like 150 or 99.50.');
    if (outstanding === 0) return setError(`${userName(fromId)} does not owe ${userName(toId)} anything in this group, so there is nothing to repay.`);
    if (amount > outstanding) return setError(`That is more than what is owed. The most you can repay is ${formatEGP(outstanding)}.`);

    setError('');
    addSettlement({ groupId: group.id, fromUserId: fromId, toUserId: toId, amountPiastres: amount });
    Alert.alert(
      'Repayment recorded ✅',
      `${userName(fromId)} → ${userName(toId)}: ${formatEGP(amount)}. It is a record only, so no real money moved.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <Screen>
      <View className="mb-4 rounded-2xl bg-primary-soft p-3">
        <Text className="text-sm text-ink">Heads up 👀 This only records the repayment. SplitEase does not move real money.</Text>
      </View>

      <Text className="mb-1 text-sm font-medium text-ink">Group</Text>
      <View className="mb-3 flex-row flex-wrap">
        {myGroups.map((g) => (
          <Chip key={g.id} label={g.name} selected={g.id === groupId} onPress={() => pickGroup(g.id)} />
        ))}
      </View>

      <Text className="mb-1 text-sm font-medium text-ink">Who is paying back?</Text>
      <View className="mb-3 flex-row flex-wrap">
        {group.memberIds.map((id) => (
          <Chip key={id} label={userName(id)} selected={fromId === id} onPress={() => { setFromId(id); setError(''); }} />
        ))}
      </View>

      <Text className="mb-1 text-sm font-medium text-ink">Who is getting paid back?</Text>
      <View className="mb-3 flex-row flex-wrap">
        {group.memberIds.map((id) => (
          <Chip key={id} label={userName(id)} selected={toId === id} onPress={() => { setToId(id); setError(''); }} />
        ))}
      </View>

      {toId && fromId !== toId ? (
        <View className="mb-4 rounded-2xl border border-line bg-card p-3">
          <Text className="text-xs text-muted">Outstanding</Text>
          <Text className="mt-1 text-lg font-bold text-ink">{formatEGP(outstanding)}</Text>
          {outstanding > 0 ? (
            <Button className="mt-2" variant="outline" title="Pay it all 💯" onPress={() => setAmountText(piastresToText(outstanding))} />
          ) : (
            <Text className="mt-1 text-xs text-muted">{userName(fromId)} does not owe {userName(toId)} anything here.</Text>
          )}
        </View>
      ) : null}

      <Input label="Repayment amount (EGP)" value={amountText} onChangeText={setAmountText} placeholder="0.00" keyboardType="decimal-pad" hint="Enter a smaller amount for a partial repayment." />

      {error ? (
        <View accessibilityRole="alert" className="mb-4 rounded-2xl bg-danger-soft p-3">
          <Text className="text-sm font-medium text-danger">⚠️ {error}</Text>
        </View>
      ) : null}

      <Button title="Record repayment ✅" onPress={handleSave} />
    </Screen>
  );
}
