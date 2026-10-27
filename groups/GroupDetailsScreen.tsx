import React from 'react';
import { Share, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Avatar from '../../components/Avatar';
import EmptyState from '../../components/EmptyState';
import ExpenseRow from '../../components/ExpenseRow';
import SectionHeader from '../../components/SectionHeader';
import { useApp } from '../../context/AppContext';
import { RootStackParamList } from '../../navigation/types';
import { formatEGP } from '../../utils/money';

type Props = NativeStackScreenProps<RootStackParamList, 'GroupDetails'>;

export default function GroupDetailsScreen({ route, navigation }: Props) {
  const { groupId } = route.params;
  const { groups, expenses, currentUserId, userName } = useApp();
  const group = groups.find((g) => g.id === groupId);

  if (!group) {
    return (
      <Screen>
        <EmptyState emoji="🕵️" title="Group not found" message="This group no longer exists." />
      </Screen>
    );
  }

  const groupExpenses = expenses.filter((e) => e.groupId === groupId).sort((a, b) => b.date.localeCompare(a.date));
  const total = groupExpenses.reduce((sum, e) => sum + e.amountPiastres, 0);
  const myShare = groupExpenses.reduce(
    (sum, e) => sum + (e.shares.find((s) => s.userId === currentUserId)?.amountPiastres ?? 0),
    0
  );

  const shareCode = () => {
    Share.share({ message: `Join "${group.name}" on SplitEase with the invitation code ${group.inviteCode}` });
  };

  return (
    <Screen>
      <Text className="text-3xl font-extrabold text-ink">{group.name}</Text>

      <Card className="mt-3">
        <Text className="text-xs font-medium text-muted">Invitation code · send it to your friends</Text>
        <Text selectable className="mt-1 text-3xl font-extrabold tracking-widest text-primary">{group.inviteCode}</Text>
        <Button className="mt-3" variant="outline" title="📤 Share code" onPress={shareCode} />
      </Card>

      <View className="mb-3 flex-row">
        <View className="mr-2 flex-1 rounded-3xl border border-line bg-card p-4">
          <Text className="text-xs font-medium text-muted">Group spending</Text>
          <Text className="mt-1 text-lg font-bold text-ink">{formatEGP(total)}</Text>
        </View>
        <View className="ml-2 flex-1 rounded-3xl border border-line bg-card p-4">
          <Text className="text-xs font-medium text-muted">Your share</Text>
          <Text className="mt-1 text-lg font-bold text-ink">{formatEGP(myShare)}</Text>
        </View>
      </View>

      <Button title="💸 Add expense" onPress={() => navigation.navigate('AddExpense', { groupId })} />
      <View className="mt-3 flex-row">
        <Button className="mr-2 flex-1" variant="outline" title="⚖️ View balances" onPress={() => navigation.navigate('Tabs', { screen: 'Balances' })} />
        <Button className="ml-2 flex-1" variant="outline" title="✅ Record repayment" onPress={() => navigation.navigate('SettleUp', { groupId })} />
      </View>

      <SectionHeader title={`Members (${group.memberIds.length})`} />
      <View className="flex-row flex-wrap">
        {group.memberIds.map((id) => (
          <View key={id} className="mb-2 mr-2 flex-row items-center rounded-full bg-card py-1 pl-1 pr-4 border border-line">
            <Avatar name={userName(id)} size={30} />
            <Text className="ml-2 text-sm font-medium text-ink">{userName(id)}{id === currentUserId ? ' (you)' : ''}</Text>
          </View>
        ))}
      </View>

      <SectionHeader title={`Expenses (${groupExpenses.length})`} />
      {groupExpenses.length === 0 ? (
        <EmptyState emoji="💸" title="No expenses yet" message="Nothing here yet. Add the first expense and let the splitting begin." actionLabel="Add expense" onAction={() => navigation.navigate('AddExpense', { groupId })} />
      ) : (
        groupExpenses.map((e) => <ExpenseRow key={e.id} expense={e} onPress={() => navigation.navigate('ExpenseDetails', { expenseId: e.id })} />)
      )}
    </Screen>
  );
}
