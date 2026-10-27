import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import EmptyState from '../../components/EmptyState';
import ExpenseRow from '../../components/ExpenseRow';
import SectionHeader from '../../components/SectionHeader';
import { useApp } from '../../context/AppContext';
import { Nav } from '../../navigation/types';
import { CATEGORIES, CATEGORY_EMOJI } from '../../types';
import { formatEGP } from '../../utils/money';


export default function AnalyticsScreen() {
  const navigation = useNavigation<Nav>();
  const { myGroups, expenses } = useApp();
  const [filter, setFilter] = useState<string>('all');

  const myGroupIds = myGroups.map((g) => g.id);
  const scoped = expenses.filter((e) => (filter === 'all' ? myGroupIds.includes(e.groupId) : e.groupId === filter));

  const total = scoped.reduce((sum, e) => sum + e.amountPiastres, 0);
  const average = scoped.length > 0 ? Math.round(total / scoped.length) : 0;
  const byCategory = CATEGORIES.map((c) => ({
    category: c,
    amount: scoped.filter((e) => e.category === c).reduce((sum, e) => sum + e.amountPiastres, 0),
  }))
    .filter((row) => row.amount > 0)
    .sort((a, b) => b.amount - a.amount);
  const recent = [...scoped].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const biggest = scoped.reduce<typeof scoped[number] | null>((max, e) => (max === null || e.amountPiastres > max.amountPiastres ? e : max), null);
  const topCategory = byCategory[0];

  return (
    <Screen>
      <Text className="mb-3 text-sm text-muted">Where did all the money go? 👀</Text>
      <View className="flex-row flex-wrap">
        <Chip label="All groups" selected={filter === 'all'} onPress={() => setFilter('all')} />
        {myGroups.map((g) => (
          <Chip key={g.id} label={g.name} selected={filter === g.id} onPress={() => setFilter(g.id)} />
        ))}
      </View>

      {scoped.length === 0 ? (
        <EmptyState emoji="📊" title="Nothing to show yet" message="Add an expense to a group and your spending breakdown shows up here." />
      ) : (
        <>
          <View className="mb-3 rounded-3xl bg-primary p-5">
            <Text className="text-sm font-medium text-white/80">Total spending</Text>
            <Text className="mt-1 text-4xl font-extrabold text-white">{formatEGP(total)}</Text>
            <Text className="mt-2 text-sm text-white/80">
              {scoped.length} expenses · average {formatEGP(average)}
            </Text>
            {topCategory ? (
              <Text className="mt-1 text-sm text-white/80">
                Top spend: {CATEGORY_EMOJI[topCategory.category]} {topCategory.category}
              </Text>
            ) : null}
            {biggest ? (
              <Text className="mt-1 text-sm text-white/80">
                Biggest: {biggest.description} ({formatEGP(biggest.amountPiastres)})
              </Text>
            ) : null}
          </View>

          <SectionHeader title="Spending by category" />
          <Card>
            {byCategory.map((row) => {
              const percent = Math.round((row.amount / total) * 100);
              return (
                <View key={row.category} className="mb-4">
                  <View className="mb-1 flex-row justify-between">
                    <Text className="text-sm font-bold text-ink">
                      {CATEGORY_EMOJI[row.category]} {row.category}
                    </Text>
                    <Text className="text-sm text-muted">
                      {formatEGP(row.amount)} · {percent}%
                    </Text>
                  </View>
                  <View accessibilityLabel={`${row.category} is ${percent} percent of spending`} className="h-3 overflow-hidden rounded-full bg-primary-soft">
                    <View className="h-3 rounded-full bg-primary" style={{ width: `${percent}%` }} />
                  </View>
                </View>
              );
            })}
          </Card>

          <SectionHeader title="Recent spending" />
          {recent.map((e) => (
            <ExpenseRow key={e.id} expense={e} onPress={() => navigation.navigate('ExpenseDetails', { expenseId: e.id })} />
          ))}
        </>
      )}
    </Screen>
  );
}
