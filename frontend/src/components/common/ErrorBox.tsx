export default function ErrorBox({ message }: { message: string }) {
    return (
        <div className="error-box" role="alert" aria-live="polite">
            {message}
        </div>
    );
}