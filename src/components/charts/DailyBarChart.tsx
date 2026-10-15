import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { BarChart } from 'react-native-gifted-charts';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

interface DayCount {
  date: string;
  count: number;
}

interface Props {
  data: DayCount[];
  maxBars?: number; // show last N days in week view
}

const WEEKDAY_SHORT = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

export function DailyBarChart({ data, maxBars = 30 }: Props) {
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const displayData = data.slice(-maxBars);
  const maxVal = Math.max(...displayData.map((d) => d.count), 1);
  const chartWidth = width - 64;
  const barWidth = Math.max(10, Math.min(28, Math.floor(chartWidth / displayData.length) - 4));

  const barData = displayData.map((d) => {
    const dow = dayjs(d.date).day(); // 0=Sun
    return {
      value: d.count,
      label: displayData.length <= 14 ? WEEKDAY_SHORT[dow] : d.count > 0 ? '' : '',
      frontColor: theme.colors.primary,
      topLabelComponent: d.count > 0
        ? () => (
            <Text style={{ fontSize: 9, color: theme.colors.onSurfaceVariant, marginBottom: 2 }}>
              {d.count}
            </Text>
          )
        : undefined,
    };
  });

  return (
    <View style={styles.container}>
      <BarChart
        data={barData}
        width={chartWidth}
        height={140}
        barWidth={barWidth}
        spacing={Math.max(2, Math.floor((chartWidth - barData.length * barWidth) / barData.length))}
        roundedTop
        hideRules
        xAxisThickness={1}
        xAxisColor={theme.colors.outline}
        yAxisThickness={0}
        yAxisTextStyle={{ color: theme.colors.onSurfaceVariant, fontSize: 10 }}
        noOfSections={3}
        maxValue={Math.ceil(maxVal * 1.2)}
        hideYAxisText={displayData.length > 20}
        labelWidth={barWidth + 2}
        xAxisLabelTextStyle={{ color: theme.colors.onSurfaceVariant, fontSize: 10 }}
        showScrollIndicator={false}
        disableScroll
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingLeft: 4 },
});
