import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacityProps 
} from 'react-native';
import { colors, typography } from '../theme/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'outline' | 'text';
  loading?: boolean;
}

export function Button({ 
  title, 
  variant = 'primary', 
  loading = false, 
  style, 
  disabled,
  ...rest 
}: ButtonProps) {
  
  const getBackgroundColor = () => {
    if (disabled) return colors.text.placeholder;
    if (variant === 'outline' || variant === 'text') return 'transparent';
    return colors.primary;
  };

  const getTextColor = () => {
    if (disabled) return colors.text.inverted;
    if (variant === 'outline') return colors.primary;
    if (variant === 'text') return colors.text.secondary;
    return colors.text.inverted;
  };

  const getBorderColor = () => {
    if (variant === 'outline') return colors.primary;
    return 'transparent';
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
        },
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    borderRadius: 25, // Arredondado conforme imagem
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  text: {
    fontSize: typography.size.md,
    fontWeight: 'bold',
  },
});
