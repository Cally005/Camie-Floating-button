// src/hooks/useDashboardData.d.ts
declare module '../hooks/useDashboardData' {
    const useDashboardData: () => {
        data: {
            totalCalls: number;
            resolvedInquiries: number;
            transferredCalls: number;
        };
        loading: boolean;
    };
    export default useDashboardData;
}