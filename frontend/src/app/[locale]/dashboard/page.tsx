
import { Folder, Users, Clock, GraduationCap } from 'lucide-react';
import { getDictionary } from '@/lib/dictionaries';
import { StatsCard, RecentActivity } from '@/components/dashboard';

interface PageProps {
    params: { locale: string };
}

export default async function HomePage({ params }: PageProps) {
    const { locale } = await params;
    const dict = await getDictionary(locale as "en" | "cz");

    const activities = [
        {
            message: 'New project "AI Research" submitted by John Doe',
            timestamp: '2 hours ago',
            type: 'success' as const
        },
        {
            message: 'Review completed for "Machine Learning Thesis"',
            timestamp: '4 hours ago',
            type: 'info' as const
        },
        {
            message: 'New user registered: Sarah Wilson',
            timestamp: '1 day ago',
            type: 'warning' as const
        }
    ];

    return (
        <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
                <StatsCard
                    title={`Total ${dict.sidebar.projects}`}
                    value="247"
                    icon={Folder}
                />

                <StatsCard
                    title="Active Users"
                    value="1,324"
                    icon={Users}
                    iconColor="text-success"
                    bgColor="bg-background-hover"
                />

                <StatsCard
                    title="Pending Reviews"
                    value="43"
                    icon={Clock}
                    iconColor="text-warning"
                    bgColor="bg-background-hover"
                />

                <StatsCard
                    title={dict.sidebar.schools}
                    value="12"
                    icon={GraduationCap}
                    iconColor="text-primary"
                    bgColor="bg-background-hover"
                />
            </div>

            {/* Recent Activity - Full Width */}
            <div className="w-full">
                <RecentActivity activities={activities} />
            </div>
        </>
    );
}
