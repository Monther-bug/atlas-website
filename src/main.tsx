// TEMPORARY entry (Part A1). Part C replaces this whole file with the real app.
// It proves the build works and shows the type scale for the font checks in A1.5.
import { createRoot } from 'react-dom/client';
import './styles.css';

function Specimen() {
  return (
    <main className="shell section-y">
      <h1 className="t-h1">من الرافعات الصغيرة للكبيرات، لكل مشروع رافعته المناسبة</h1>
      <h1 className="t-h1" lang="en">Every project has the right crane</h1>
      <p className="t-label">السعة</p>
      <p className="t-readout">350 طن</p>
      <p className="t-spec" lang="en">GMK6350 · 350 t · all-terrain</p>
      <p className="t-body measure">تأجير الرافعات والنقل الثقيل والمناولة وخدمات النفط، من 55 إلى 350 طن.</p>
      <p className="t-body measure" lang="en">Crane hire, heavy transport, handling and oil services, from 55 to 350 t.</p>
    </main>
  );
}

const root = document.getElementById('root');
if (root) createRoot(root).render(<Specimen />);
