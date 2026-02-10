import BottomNav from "../../components/ui/BottomNav/BottomNav";
import "./Record.css";

const summary = {
  totalDistance: "11.4 km",
  totalKcal: "570 kcal",
};

const records = [
  { date: "2월 6일", time: "00:45:23", distance: "2.3 km", kcal: "115 kcal" },
  { date: "2월 5일", time: "00:32:15", distance: "1.8 km", kcal: "90 kcal" },
  { date: "2월 4일", time: "01:02:40", distance: "3.1 km", kcal: "155 kcal" },
  { date: "2월 3일", time: "00:28:10", distance: "1.6 km", kcal: "80 kcal" },
];

export default function Record() {
  return (
    <div className="container">
      <h2 className="title">산책 기록</h2>

      {/* 요약 카드 */}
      <div className="summary-row">
        <div className="summary-card blue">
          <span>총 거리</span>
          <strong>{summary.totalDistance}</strong>
        </div>
        <div className="summary-card orange">
          <span>총 칼로리</span>
          <strong>{summary.totalKcal}</strong>
        </div>
      </div>

      {/* 기록 리스트 */}
      {records.map((item, index) => (
        <div className="record-card" key={index}>
          <div className="record-header">
            <span className="date">{item.date}</span>
            <span className="time">{item.time}</span>
          </div>

          <div className="record-body">
            <div className="info-box green">
              <span>거리</span>
              <strong>{item.distance}</strong>
            </div>
            <div className="info-box peach">
              <span>칼로리</span>
              <strong>{item.kcal}</strong>
            </div>
          </div>
        </div>
      ))}

      <BottomNav />
    </div>
  );
}
