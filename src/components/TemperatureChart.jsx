import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

function TemperatureChart({ weather }) {
    const data = weather.daily.time.map((date, index) => ({
        date,
        temperature: weather.daily.temperature_2m_mean[index]
    }));

    return (
        <div className="temperature-chart">
            <div className="temperature-chart-header">
                <div>
                    <h2>Temperatura w wybranym okresie</h2>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={320}>
                <LineChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 20,
                        left: 0,
                        bottom: 10
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                    />

                    <YAxis
                        unit="°C"
                        tick={{ fontSize: 12 }}
                    />

                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#131d30',
                            border: '1px solid #293751',
                            borderRadius: '10px',
                            color: '#e8eefb'
                        }}
                        labelStyle={{
                            color: '#95a5bf'
                        }}
                        itemStyle={{
                            color: '#e8eefb'
                        }}
                        formatter={(value) => [`${value.toFixed(1)}°C`, 'Temperatura']}
                        labelFormatter={(date) => `Data: ${date}`}
                    />

                    <Line
                        type="monotone"
                        dataKey="temperature"
                        stroke="#60a5fa"
                        strokeWidth={3}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default TemperatureChart;