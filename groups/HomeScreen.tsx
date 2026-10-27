import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Avatar from '../../components/Avatar';
import SectionHeader from '../../components/SectionHeader';
import EmptyState from '../../components/EmptyState';
import ExpenseRow from '../../components/ExpenseRow';
import { useApp } from '../../context/AppContext';
import { Nav } from '../../navigation/types';
import { balancesForUser, sumBalances } from '../../utils/balances';
import { formatEGP } from '../../utils/money';

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { currentUserId, userName, myGroups, expenses, settlements } = useApp();

  const balances = balancesForUser(myGroups, currentUserId, expenses, settlements);
  const youOwe = sumBalances(balances, 'iOwe');
  const youAreOwed = sumBalances(balances, 'owesMe');
  const net = youAreOwed - youOwe;

  const myGroupIds = myGroups.map((g) => g.id);
  const recent = expenses
    .filter((e) => myGroupIds.includes(e.groupId))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  const vibe =
    net === 0 ? "You're all square. Nobody owes anybody 😌" : net > 0 ? 'Overall, your friends owe you. Easy money 😎' : 'Overall, you owe your friends. Pay up soon 😅';

  return (
    <Screen>
      <View className="mb-4 flex-row items-center">
        <Avatar name={userName(currentUserId)} size={48} />
        <View className="ml-3">
          <Text className="text-2xl font-extrabold text-ink">Hey {userName(currentUserId)} 👋</Text>
          <Text className="text-sm text-muted">Split bills, not friendships.</Text>
        </View>
      </View>

      <View className="mb-4 rounded-3xl bg-primary p-5">
        <Text className="text-sm font-medium text-white/80">Your balance</Text>
        <Text className="mt-1 text-4xl font-extrabold text-white">
          {net > 0 ? '+' : ''}
          {formatEGP(net)}
        </Text>
        <Text className="mt-1 text-sm text-white/80">{vibe}</Text>
        <View className="mt-4 flex-row">
          <View className="mr-2 flex-1 rounded-2xl bg-white/15 p-3">
            <Text className="text-xs font-medium text-white/80">You owe</Text>
            <Text className="mt-1 text-base font-bold text-white">{formatEGP(youOwe)}</Text>
          </View>
          <View className="ml-2 flex-1 rounded-2xl bg-white/15 p-3">
            <Text className="text-xs font-medium text-white/80">You're owed</Text>
            <Text className="mt-1 text-base font-bold text-white">{formatEGP(youAreOwed)}</Text>
          </View>
        </View>
      </View>

      <View className="flex-row">
        <Button className="mr-2 flex-1" title="✨ Create group" onPress={() => navigation.navigate('Tabs', { screen: 'Groups', params: { mode: 'create' } })} />
        <Button className="ml-2 flex-1" variant="outline" title="🔑 Join group" onPress={() => navigation.navigate('Tabs', { screen: 'Groups', params: { mode: 'join' } })} />
      </View>

      <SectionHeader title="Recent expenses" actionLabel="See balances →" onAction={() => navigation.navigate('Tabs', { screen: 'Balances' })} />
      {recent.length === 0 ? (
        <EmptyState emoji="🍜" title="No expenses yet" message="Open a group and split your first bill. Koshary counts." />
      ) : (
        recent.map((e) => <ExpenseRow key={e.id} expense={e} onPress={() => navigation.navigate('ExpenseDetails', { expenseId: e.id })} />)
      )}

      <SectionHeader title="Your groups" actionLabel="See all" onAction={() => navigation.navigate('Tabs', { screen: 'Groups' })} />
      {myGroups.length === 0 ? (
        <EmptyState emoji="👯" title="No groups yet" message="Start one for your flat, your trip, or your squad, or join a friend's with a code." />
      ) : (
        myGroups.map((g) => (
          <Card key={g.id} onPress={() => navigation.navigate('GroupDetails', { groupId: g.id })}>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-base font-bold text-ink">{g.name}</Text>
                <Text className="mt-1 text-xs text-muted">{g.memberIds.length} people</Text>
              </View>
              <Text className="text-lg text-primary">›</Text>
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}
