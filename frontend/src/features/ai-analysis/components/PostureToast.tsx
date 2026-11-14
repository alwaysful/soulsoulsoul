interface Props {
  message: string | null;
  onClose: () => void;
}

export function PostureToast({ message, onClose }: Props) {
  if (!message) return null;
  return (
    <div className="coach-toast" role="alert">
      <p>{message}</p>
      <button type="button" className="btn btn-ghost" onClick={onClose}>
        확인
      </button>
    </div>
  );
}
