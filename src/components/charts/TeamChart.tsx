import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { mockTeams, mockObjectives } from '../../mocks/data';

export default function TeamChart() {
  // Calculate team progress data
  const teamData = mockTeams.map((team) => {
    const teamObjs = mockObjectives.filter((o) => o.teamId === team.id);
    const avgProgress = teamObjs.length > 0
      ? Math.round(teamObjs.reduce((sum, o) => sum + o.progress, 0) / teamObjs.length)
      : 0;
    return {
      name: team.name.replace(' Team', ''),
      value: avgProgress,
    };
  });

  const COLORS = ['#E53935', '#1E88E5', '#FDD835'];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={teamData}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}%`}
          labelLine={{ stroke: '#9CA3AF', strokeWidth: 1 }}
        >
          {teamData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
          formatter={(value: number) => [`${value}%`, '달성률']}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
