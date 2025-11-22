declare module '@react-native-community/slider' {
  import { Component } from 'react';
  import { ViewStyle, StyleProp } from 'react-native';

  export interface SliderProps {
    value?: number;
    minimumValue?: number;
    maximumValue?: number;
    step?: number;
    minimumTrackTintColor?: string;
    maximumTrackTintColor?: string;
    thumbTintColor?: string;
    onValueChange?: (value: number) => void;
    onSlidingComplete?: (value: number) => void;
    style?: StyleProp<ViewStyle>;
    disabled?: boolean;
    [key: string]: any;
  }

  export default class Slider extends Component<SliderProps> {}
}

