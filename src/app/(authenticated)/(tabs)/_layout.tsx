import { Tabs } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { colors } from '../../theme/theme'
import { Ionicons } from '@expo/vector-icons'

export default function TabsLayout() {
  return (
    <SafeAreaProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.text.secondary,
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'Mesas',
            tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'grid' : 'grid-outline'} size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="menu"
          options={{
            title: 'Cardápio',
            tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'fast-food' : 'fast-food-outline'} size={size} color={color} />,
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  )
}
