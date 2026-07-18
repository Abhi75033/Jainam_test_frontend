import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import AdminLayout from "@/components/layout/AdminLayout";
import LoginPage from "@/pages/LoginPage";
import LandingPage from "@/pages/LandingPage";
import DashboardPage from "@/pages/DashboardPage";
import MembersPage from "@/pages/MembersPage";
import FamilyPage from "@/pages/FamilyPage";
import MonksPage from "@/pages/MonksPage";
import MonkDetailPage from "@/pages/MonkDetailPage";
import OrgListPage from "@/pages/OrgListPage";
import OrgDetailPage from "@/pages/OrgDetailPage";
import StaffPage from "@/pages/StaffPage";
import VisitorsPage from "@/pages/VisitorsPage";
import BookingsPage from "@/pages/BookingsPage";
import DonationsPage from "@/pages/DonationsPage";
import EventsPage from "@/pages/EventsPage";
import TicketsPage from "@/pages/TicketsPage";
import SeatingPage from "@/pages/SeatingPage";
import ToursPage from "@/pages/ToursPage";
import FeedPage from "@/pages/FeedPage";
import OffersPage from "@/pages/OffersPage";
import AdsPage from "@/pages/AdsPage";
import NewsPage from "@/pages/NewsPage";
import CommunityPagesPage from "@/pages/CommunityPagesPage";
import PollsPage from "@/pages/PollsPage";
import CalendarPage from "@/pages/CalendarPage";
import CountersPage from "@/pages/CountersPage";
import TrackingPage from "@/pages/TrackingPage";
import DevicesPage from "@/pages/DevicesPage";
import AlertsPage from "@/pages/AlertsPage";
import CommunicationPage from "@/pages/CommunicationPage";
import AnnouncementsPage from "@/pages/AnnouncementsPage";
import GalleryPage from "@/pages/GalleryPage";
import VolunteersPage from "@/pages/VolunteersPage";
import SupportTicketsPage from "@/pages/SupportTicketsPage";
import NotificationsPage from "@/pages/NotificationsPage";
import NotificationPreferencesPage from "@/pages/NotificationPreferencesPage";
import ReportsPage from "@/pages/ReportsPage";
import SettingsPage from "@/pages/SettingsPage";
import AuditLogsPage from "@/pages/AuditLogsPage";
import MasterDataPage from "@/pages/MasterDataPage";
import BulkImportPage from "@/pages/BulkImportPage";
import TourJatraPage from "@/pages/TourJatraPage";

// New modules imports per client Super Admin spec
import NonJainMembersPage from "@/pages/NonJainMembersPage";
import StanaksPage from "@/pages/StanaksPage";
import UpashraysPage from "@/pages/UpashraysPage";
import ChaturmasPage from "@/pages/ChaturmasPage";
import ReceiptsPage from "@/pages/ReceiptsPage";
import MSTrackingPage from "@/pages/MSTrackingPage";
import ManualTrackingPage from "@/pages/ManualTrackingPage";
import JourneyLogsPage from "@/pages/JourneyLogsPage";
import RoutesPage from "@/pages/RoutesPage";
import LiveMapPage from "@/pages/LiveMapPage";
import FaqPage from "@/pages/FaqPage";
import BannersPage from "@/pages/BannersPage";
import HomeSectionsPage from "@/pages/HomeSectionsPage";
import FeedbackPage from "@/pages/FeedbackPage";
import IncorrectReportsPage from "@/pages/IncorrectReportsPage";
import SubscriptionPlansPage from "@/pages/SubscriptionPlansPage";
import AdminsPage from "@/pages/AdminsPage";
import MemberReportsPage from "@/pages/MemberReportsPage";
import DonationReportsPage from "@/pages/DonationReportsPage";
import EventsReportsPage from "@/pages/EventsReportsPage";
import FeedAnalyticsPage from "@/pages/FeedAnalyticsPage";
import AppUsagePage from "@/pages/AppUsagePage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/welcome" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />

            <Route path="members" element={<MembersPage />} />
            <Route path="non-jain-members" element={<NonJainMembersPage />} />
            <Route path="family" element={<FamilyPage />} />
            <Route path="monks" element={<MonksPage />} />
            <Route path="monks/:id" element={<MonkDetailPage />} />

            <Route
              path="temples"
              element={
                <OrgListPage
                  endpoint="/temples"
                  entity="temple"
                  label="Temple"
                  pluralLabel="Temples"
                  moduleKey="TEMPLES"
                  testId="temples-page"
                />
              }
            />
            <Route
              path="temples/:id"
              element={
                <OrgDetailPage
                  basePath="/temples"
                  entityLabel="Temple"
                  apiPrefix="/temples"
                />
              }
            />

            <Route
              path="dharamshalas"
              element={
                <OrgListPage
                  endpoint="/dharamshalas"
                  entity="dharamshala"
                  label="Dharamshala"
                  pluralLabel="Dharamshalas"
                  moduleKey="DHARAMSHALAS"
                  testId="dharamshalas-page"
                />
              }
            />
            <Route
              path="dharamshalas/:id"
              element={
                <OrgDetailPage
                  basePath="/dharamshalas"
                  entityLabel="Dharamshala"
                  apiPrefix="/dharamshalas"
                />
              }
            />

            <Route
              path="jain-centers"
              element={
                <OrgListPage
                  endpoint="/jain-centers"
                  entity="jain-center"
                  label="Jain Center"
                  pluralLabel="Jain Centers"
                  moduleKey="JAIN_CENTERS"
                  testId="jain-centers-page"
                />
              }
            />
            <Route
              path="jain-centers/:id"
              element={
                <OrgDetailPage
                  basePath="/jain-centers"
                  entityLabel="Jain Center"
                  apiPrefix="/jain-centers"
                />
              }
            />

            <Route
              path="stanaks"
              element={
                <StanaksPage />
              }
            />
            <Route
              path="upashrays"
              element={
                <UpashraysPage />
              }
            />

            <Route path="staff" element={<StaffPage />} />
            <Route path="visitors" element={<VisitorsPage />} />
            
            <Route path="bookings" element={<BookingsPage />} />
            
            <Route path="donations" element={<DonationsPage />} />
            <Route path="receipts" element={<ReceiptsPage />} />
            
            <Route path="events" element={<EventsPage />} />
            <Route path="tickets" element={<TicketsPage />} />
            <Route path="seating" element={<SeatingPage />} />
            
            <Route path="tours" element={<ToursPage />} />
            <Route path="chaturmas" element={<ChaturmasPage />} />
            
            <Route path="feed" element={<FeedPage />} />
            <Route path="offers" element={<OffersPage />} />
            <Route path="ads" element={<AdsPage />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="community-pages" element={<CommunityPagesPage />} />
            <Route path="polls" element={<PollsPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="counters" element={<CountersPage />} />
            
            <Route path="ms-tracking" element={<MSTrackingPage />} />
            <Route path="tracking" element={<TrackingPage />} />
            <Route path="manual-tracking" element={<ManualTrackingPage />} />
            <Route path="journey-logs" element={<JourneyLogsPage />} />
            <Route path="routes" element={<RoutesPage />} />
            <Route path="live-map" element={<LiveMapPage />} />
            <Route path="devices" element={<DevicesPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            
            <Route path="communication" element={<CommunicationPage />} />
            <Route path="announcements" element={<AnnouncementsPage />} />
            
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="faq" element={<FaqPage />} />
            <Route path="banners" element={<BannersPage />} />
            <Route path="home-sections" element={<HomeSectionsPage />} />
            
            <Route path="volunteers" element={<VolunteersPage />} />
            <Route path="support-tickets" element={<SupportTicketsPage />} />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="incorrect-reports" element={<IncorrectReportsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="notifications/preferences" element={<NotificationPreferencesPage />} />
            
            <Route path="reports" element={<ReportsPage />} />
            <Route path="reports/members" element={<MemberReportsPage />} />
            <Route path="reports/donations" element={<DonationReportsPage />} />
            <Route path="reports/events" element={<EventsReportsPage />} />
            <Route path="reports/feed-analytics" element={<FeedAnalyticsPage />} />
            <Route path="reports/app-usage" element={<AppUsagePage />} />
            
            <Route path="subscription-plans" element={<SubscriptionPlansPage />} />
            <Route path="admins" element={<AdminsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
            <Route path="master-data" element={<MasterDataPage />} />
            <Route path="members/bulk-import" element={<BulkImportPage />} />
            <Route path="tours/:tourId/participants/:participantId" element={<TourJatraPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
