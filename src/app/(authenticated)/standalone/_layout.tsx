import { Stack } from 'expo-router'

export default function StandaloneLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="collaborator" />
    </Stack>
  )
}

