import { useState } from 'react';
import './library-reserve.css';
import { LibraryPanel as BasePanel } from './LibraryPanels';

interface Room {
  name: string;
  total: number;
  used: number;
}

interface Rsv {
  id: string;
  kind: 'seat' | 'room';
  label: string;
  when: string;
}

const KEY = 'libReservations';
const DAY = 86_400_000;

const ROOMS: Room[] = [
  { name: '제1열람실', total: 120, used: 82 },
  { name: '제2열람실', total: 96, used: 41 },
  { name: '노트북실', total: 64, used: 58 },
  { name: '그룹스터디룸', total: 12, used: 5 },
];
const SLOTS = ['09', '10', '11', '12', '13', '14', '15', '16', '17'];
const SROOMS = ['스터디룸 A', '스터디룸 B', '스터디룸 C'];

function load(): Rsv[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as Rsv[];
  } catch {
    return [];
  }
}

// 예약은 브라우저에만 저장 (데모)
function useRsv() {
  const [list, setList] = useState<Rsv[]>(load);
  const save = (next: Rsv[]) => {
    setList(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* 무시 */
    }
  };
  return {
    list,
    add: (r: Rsv) =>
      save([...list.filter((x) => !(r.kind === 'seat' && x.kind === 'seat')), r]),
    remove: (id: string) => save(list.filter((x) => x.id !== id)),
  };
}

const isTaken = (r: Room, i: number) => (i * 17 + r.name.length) % r.total < r.used;

function MyList({ list, onRemove }: { list: Rsv[]; onRemove: (id: string) => void }) {
  if (list.length === 0) return <p className="muted">내 예약 없음</p>;
  return (
    <ul className="lp-list lr-mine">
      {list.map((x) => (
        <li key={x.id}>
          <div>
            <strong>{x.label}</strong>
            <span className="muted">{x.when}</span>
          </div>
          <button type="button" className="btn" onClick={() => onRemove(x.id)}>
            취소
          </button>
        </li>
      ))}
    </ul>
  );
}

function SeatFinder() {
  const { list, add, remove } = useRsv();
  const [ri, setRi] = useState(0);
  const [onlyFree, setOnlyFree] = useState(true);
  const r = ROOMS[ri];
  const seats = Array.from({ length: r.total }, (_, i) => i);
  const freeOf = (room: Room) =>
    Array.from({ length: room.total }, (_, i) => i).filter((i) => !isTaken(room, i));
  const mineId = (i: number) => `seat:${ri}:${i}`;
  const reserve = (i: number) =>
    add({
      id: mineId(i),
      kind: 'seat',
      label: `${r.name} ${i + 1}번`,
      when: `${new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 예약`,
    });
  const firstFree = freeOf(r)[0];
  const shown = seats.filter((i) => !onlyFree || !isTaken(r, i));

  return (
    <>
      <div className="lp-tabs">
        {ROOMS.map((x, i) => (
          <button
            key={x.name}
            type="button"
            className={i === ri ? 'chip chip-active' : 'chip'}
            onClick={() => setRi(i)}
          >
            {x.name} {freeOf(x).length}/{x.total}
          </button>
        ))}
      </div>
      <div className="row lr-bar">
        <label className="lr-check">
          <input
            type="checkbox"
            checked={onlyFree}
            onChange={(e) => setOnlyFree(e.target.checked)}
          />
          빈자리만
        </label>
        <button
          type="button"
          className="btn btn-primary"
          disabled={firstFree === undefined}
          onClick={() => firstFree !== undefined && reserve(firstFree)}
        >
          첫 빈자리 예약
        </button>
        <span className="muted">빈자리 {freeOf(r).length}석</span>
      </div>
      <div className="lp-seats">
        {shown.map((i) => {
          const mine = list.some((x) => x.id === mineId(i));
          const taken = isTaken(r, i);
          const cls = mine ? 'lp-seat lp-mine' : taken ? 'lp-seat lp-taken' : 'lp-seat';
          return (
            <button
              key={i}
              type="button"
              className={cls}
              disabled={taken && !mine}
              onClick={() => (mine ? remove(mineId(i)) : reserve(i))}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <h3 className="lr-h">내 예약</h3>
      <MyList list={list} onRemove={remove} />
    </>
  );
}

const pad = (n: number) => String(n).padStart(2, '0');
const DATES = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(Date.now() + i * DAY);
  return {
    key: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    label: d.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric', weekday: 'short' }),
  };
});

// 날짜/방/시간으로 고정된 가짜 마감 여부
function busy(date: string, room: string, slot: string): boolean {
  let n = 0;
  for (const c of `${date}${room}${slot}`) n = (n * 31 + c.charCodeAt(0)) % 97;
  return n % 4 === 0;
}

function RoomBooking() {
  const { list, add, remove } = useRsv();
  const [di, setDi] = useState(0);
  const date = DATES[di];
  const idOf = (room: string, slot: string) => `room:${date.key}:${room}:${slot}`;
  const rooms = list.filter((x) => x.kind === 'room');

  return (
    <>
      <div className="lp-tabs">
        {DATES.map((d, i) => (
          <button
            key={d.key}
            type="button"
            className={i === di ? 'chip chip-active' : 'chip'}
            onClick={() => setDi(i)}
          >
            {d.label}
          </button>
        ))}
      </div>
      <div className="lp-scroll">
        <table className="lp-table">
          <thead>
            <tr>
              <th />
              {SLOTS.map((s) => (
                <th key={s}>{s}시</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SROOMS.map((room) => (
              <tr key={room}>
                <th>{room}</th>
                {SLOTS.map((s) => {
                  const id = idOf(room, s);
                  const mine = list.some((x) => x.id === id);
                  const full = busy(date.key, room, s);
                  return (
                    <td key={s}>
                      <button
                        type="button"
                        className={mine ? 'lp-cell lp-mine' : 'lp-cell'}
                        disabled={full && !mine}
                        onClick={() =>
                          mine
                            ? remove(id)
                            : add({ id, kind: 'room', label: room, when: `${date.label} ${s}시` })
                        }
                      >
                        {mine ? '예약' : full ? '마감' : '가능'}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3 className="lr-h">내 예약</h3>
      <MyList list={rooms} onRemove={remove} />
    </>
  );
}

interface Props {
  kind: string;
  onClose: () => void;
}

export function LibraryPanel({ kind, onClose }: Props) {
  if (kind !== '열람실 좌석' && kind !== '스터디룸') {
    return <BasePanel kind={kind} onClose={onClose} />;
  }
  return (
    <div className="lib-card lp">
      <div className="row between">
        <h2>{kind}</h2>
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          닫기
        </button>
      </div>
      {kind === '열람실 좌석' ? <SeatFinder /> : <RoomBooking />}
    </div>
  );
}
