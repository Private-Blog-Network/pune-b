import SideNav from "../components/sidebar"
import DashboardStats from "../components/MainCount"
import EnrolledStudentsByCourse from "../components/EnrolledCount"
import TodayAttendanceAnalytics from "../components/today-attendance"
// import TopBar from "../components/topbar"
export default function Dashboard(){
    return (
        <>
        <SideNav/>
        <DashboardStats/>
        <hr />
        <hr />
        <EnrolledStudentsByCourse/>
        <hr/>
        <hr />
        <TodayAttendanceAnalytics/>
        </>
    )
}
// 