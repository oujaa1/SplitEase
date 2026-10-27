import React from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Avatar from '../../components/Avatar';
import EmptyState from '../../components/EmptyState';
import SectionHeader from '../../components/SectionHeader';
import { useApp } from '../../context/AppContext';
import { RootStackParamList } from '../../navigation/types';
import { CATEGORY_EMOJI } from '../../types';
import { formatEGP } from '../../utils/money';

type Props = NativeStackScreenProps<RootStackParamList, 'ExpenseDetails'>;

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between border-b border-line py-3">
      <Text className="text-sm text-muted">{label}</Text>
      <Text className="ml-4 flex-1 text-right text-sm font-medium text-ink">{value}</Text>
    </View>
  );
}

export default function ExpenseDetailsScreen({ route, navigation }: Props) {
  const { expenses, groups, userName } = useApp();
  const expense = expenses.find((e) => e.id === route.params.expenseId);
  const group = expense ? groups.find((g) => g.id === expense.groupId) : undefined;

  if (!expense) {
    return (
      <Screen>
        <EmptyState emoji="🕵️" title="Expense not found" message="This expense no longer exists." />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text className="text-2xl font-extrabold text-ink">{CATEGORY_EMOJI[expense.category]} {expense.description}</Text>
      <Text className="mb-4 mt-1 text-4xl font-extrabold text-primary">{formatEGP(expense.amountPiastres)}</Text>

      <Card>
        <InfoRow label="Group" value={group?.name ?? 'Unknown group'} />
        <InfoRow label="Paid by" value={userName(expense.paidById)} />
        <InfoRow label="Date" value={expense.date} />
        <InfoRow label="Category" value={expense.category} />
        <InfoRow label="Split method" value={expense.splitMethod === 'equal' ? 'Equal split' : 'Custom amounts'} />
      </Card>

      <SectionHeader title={`Participants (${expense.shares.length})`} />
      <Card>
        {expense.shares.map((s) => (
          <View key={s.userId} className="flex-row items-center justify-between py-2">
            <View className="flex-row items-center">
              <Avatar name={userName(s.userId)} size={32} />
              <Text className="ml-3 text-sm font-medium text-ink">{userName(s.userId)}</Text>
            </View>
            <Text className="text-sm font-bold text-ink">{formatEGP(s.amountPiastres)}</Text>
          </View>
        ))}
      </Card>

      <Button title="✏️ Edit expense" onPress={() => navigation.navigate('EditExpense', { expenseId: expense.id })} />
      {group ? (
        <Button className="mt-3" variant="outline" title="Open group" onPress={() => navigation.navigate('GroupDetails', { groupId: group.id })} />
      ) : null}
    </Screen>
  );
}
