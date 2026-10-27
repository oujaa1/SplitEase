import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Avatar from '../../components/Avatar';
import EmptyState from '../../components/EmptyState';
import SectionHeader from '../../components/SectionHeader';
import { useApp } from '../../context/AppContext';
import { Nav } from '../../navigation/types';
import { balancesForUser, PersonBalance, sumBalances } from '../../utils/balances';
import { formatEGP } from '../../utils/money';

export default function MyBalancesScreen() {
  const navigation = useNavigation<Nav>();
  const { currentUserId, myGroups, expenses, settlements, userName } = useApp();

  const balances = balancesForUser(myGroups, currentUserId, expenses, settlements);
  const owesMe = balances.filter((b) => b.direction === 'owesMe');
  const iOwe = balances.filter((b) => b.direction === 'iOwe');
  const groupName = (id: string) => myGroups.find((g) => g.id === id)?.name ?? '';

  const renderRow = (b: PersonBalance) => {
    const iAmPayer = b.direction === 'iOwe';
    const other = userName(b.otherUserId);
    return (
      <Card key={`${b.groupId}-${b.otherUserId}-${b.direction}`}>
        <View className="flex-row items-center">
          <Avatar name={other} size={44} />
          <View className="mx-3 flex-1">
            <Text className="text-base font-bold text-ink">{iAmPayer ? `You owe ${other}` : `${other} owes you`}</Text>
            <Text className="mt-1 text-xs text-muted">{groupName(b.groupId)}</Text>
          </View>
          <Text className={`text-base font-extrabold ${iAmPayer ? 'text-danger' : 'text-success'}`}>{formatEGP(b.amountPiastres)}</Text>
        </View>
        <Button
          className="mt-3"
          variant="outline"
          title={iAmPayer ? `💸 Repay ${other}` : `✅ ${other} paid me`}
          onPress={() =>
            navigation.navigate('SettleUp', {
              groupId: b.groupId,
              fromUserId: iAmPayer ? currentUserId : b.otherUserId,
              toUserId: iAmPayer ? b.otherUserId : currentUserId,
            })
          }
        />
      </Card>
    );
  };

  return (
    <Screen>
      <Text className="mb-3 text-sm text-muted">The honest scoreboard. No awkward texts needed.</Text>
      <View className="flex-row">
        <View className="mr-2 flex-1 rounded-3xl bg-success-soft p-4">
          <Text className="text-xs font-medium text-success">Owed to you</Text>
          <Text className="mt-1 text-lg font-extrabold text-ink">{formatEGP(sumBalances(balances, 'owesMe'))}</Text>
        </View>
        <View className="ml-2 flex-1 rounded-3xl bg-danger-soft p-4">
          <Text className="text-xs font-medium text-danger">You owe</Text>
          <Text className="mt-1 text-lg font-extrabold text-ink">{formatEGP(sumBalances(balances, 'iOwe'))}</Text>
        </View>
      </View>

      {balances.length === 0 ? (
        <View className="mt-4">
          <EmptyState emoji="🎉" title="You are all settled up" message="Nobody owes you and you owe nobody. Legend. New expenses will show up here." />
        </View>
      ) : (
        <>
          <SectionHeader title="Owes you" />
          {owesMe.length === 0 ? <Text className="mb-2 text-sm text-muted">Nobody owes you anything right now 🙌</Text> : owesMe.map(renderRow)}
          <SectionHeader title="You owe" />
          {iOwe.length === 0 ? <Text className="mb-2 text-sm text-muted">You do not owe anyone right now 😎</Text> : iOwe.map(renderRow)}
        </>
      )}

      <Button className="mt-4" title="⚖️ Settle up" onPress={() => navigation.navigate('SettleUp')} />
      <Text className="mt-3 text-center text-xs text-muted">Repayments are recorded for tracking only. SplitEase never moves real money.</Text>
    </Screen>
  );
}
