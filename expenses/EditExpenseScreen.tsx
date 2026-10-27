import React from 'react';
import { Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/Screen';
import ExpenseForm from '../../components/ExpenseForm';
import EmptyState from '../../components/EmptyState';
import { useApp } from '../../context/AppContext';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'EditExpense'>;

export default function EditExpenseScreen({ route, navigation }: Props) {
  const { expenses, updateExpense } = useApp();
  const expense = expenses.find((e) => e.id === route.params.expenseId);

  if (!expense) {
    return (
      <Screen>
        <EmptyState emoji="🕵️" title="Expense not found" message="This expense no longer exists." />
      </Screen>
    );
  }

  return (
    <Screen>
      <ExpenseForm
        groupId={expense.groupId}
        initial={expense}
        submitLabel="Update expense"
        onSubmit={(input) => {
          updateExpense(expense.id, input);
          Alert.alert('Updated ✅', 'The expense and everyone’s shares are updated.', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        }}
      />
    </Screen>
  );
}
