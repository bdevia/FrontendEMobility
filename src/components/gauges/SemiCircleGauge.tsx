import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface SemiCircleGaugeProps {
  label: string;
  value: number;
}

const SemiCircleGauge: React.FC<SemiCircleGaugeProps> = ({ label, value }) => {
  const options: ApexOptions = {
    chart: {
      type: 'radialBar',
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        track: {
          background: '#e7e7e7',
          strokeWidth: '97%',
          margin: 5, // margin is in pixels
        },
        dataLabels: {
          name: {
            show: true,
          },
          value: {
            show: true,
            formatter: (val: number) => `${val}`,
          },
        },
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        shadeIntensity: 0.5,
        gradientToColors: ['#FFC371'],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100],
      },
    },
    labels: [label],
  };

  const series = [value];

  return (
    <div className='semi-circle-gauge-container'>
        <Chart options={options} series={series} type="radialBar" height={350} />
    </div>
  );
};

export default SemiCircleGauge;
