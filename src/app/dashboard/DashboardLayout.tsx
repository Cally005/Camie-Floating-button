import FloatingButton from "../buttons/FloatingButton";




const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="p-4">
            {children}
            <FloatingButton />
        </div>
    );
};

export default DashboardLayout;
