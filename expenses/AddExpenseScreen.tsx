import React from 'react';
import { Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/Screen';
import ExpenseForm from '../../components/ExpenseForm';
import { useApp } from '../../context/AppContext';
import { RootStackParamList } from '../../navigation/types';
import { formatEGP } from '../../utils/money';

type Props = NativeStackScreenProps<RootStackParamList, 'AddExpense'>;

export default function AddExpenseScreen({ route, navigation }: Props) {
  const { addExpense } = useApp();
  return (
    <Screen>
      <ExpenseForm
        groupId={route.params.groupId}
        submitLabel="Save expense 💸"
        onSubmit={(input) => {
          addExpense(input);
          Alert.alert('Expense saved 💸', `${input.description} (${formatEGP(input.amountPiastres)}) is in. Everyone's shares are updated.`, [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        }}
      />
    </Screen>
  );
}
