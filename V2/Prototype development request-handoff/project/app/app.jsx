// app.jsx — root: state, routing, device frame
const { useState: uS, useEffect: uE } = React;
const ST = window.HabitStore;

function App() {
  const [habits, setHabits] = uS(() => ST.load());
  const [route, setRoute] = uS({ name: 'today', id: null });
  const [addOpen, setAddOpen] = uS(false);

  const persist = (next) => { setHabits(next); ST.save(next); };

  const toggle = (id) => {
    const tk = ST.todayKey();
    persist(habits.map(h => {
      if (h.id !== id) return h;
      const history = { ...h.history };
      if (history[tk]) delete history[tk]; else history[tk] = true;
      return { ...h, history };
    }));
  };

  const create = ({ name, goal, color }) => {
    const id = 'h' + Date.now();
    persist([...habits, { id, name, goal, color, freq: 'daily', history: {} }]);
  };

  const remove = (id) => {
    persist(habits.filter(h => h.id !== id));
    setRoute({ name: 'today', id: null });
  };

  const detailHabit = route.name === 'detail' ? habits.find(h => h.id === route.id) : null;
  // if a detail habit was deleted, fall back
  uE(() => {
    if (route.name === 'detail' && !habits.find(h => h.id === route.id)) {
      setRoute({ name: 'today', id: null });
    }
  }, [habits]);

  return (
    <div className="stage">
      <div className="device-scale">
        <IOSDevice width={402} height={874}>
          {/* sliding screens */}
          <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            {/* today */}
            <div style={slideStyle(route.name === 'today' ? 0 : -1)}>
              <div style={{ height: '100%', overflowY: 'auto', background: '#F6F4F0' }}>
                <TodayScreen
                  habits={habits}
                  onToggle={toggle}
                  onOpen={(id) => setRoute({ name: 'detail', id })}
                  onAdd={() => setAddOpen(true)}
                />
              </div>
            </div>
            {/* detail */}
            <div style={slideStyle(route.name === 'detail' ? 0 : 1)}>
              <div style={{ height: '100%', overflowY: 'auto', background: '#F6F4F0' }}>
                <DetailScreen
                  habit={detailHabit}
                  onBack={() => setRoute({ name: 'today', id: null })}
                  onToggle={toggle}
                  onDelete={() => remove(route.id)}
                />
              </div>
            </div>
          </div>

          {/* add sheet overlays everything */}
          <AddSheet open={addOpen} onClose={() => setAddOpen(false)} onCreate={create} />
        </IOSDevice>
      </div>
    </div>
  );
}

function slideStyle(pos) {
  // pos: 0 = active, -1 = parked left, 1 = parked right
  return {
    position: 'absolute', inset: 0,
    transform: `translateX(${pos * 100}%)`,
    transition: 'transform .34s cubic-bezier(.32,.72,0,1)',
    pointerEvents: pos === 0 ? 'auto' : 'none',
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
