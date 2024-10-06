type Props = {
    children: JSX.Element | JSX.Element[]
}

export default function Dialog(props: Props) {
    return (
        <div className="absolute top-0 left-0 w-screen bg-slate-800 h-screen backdrop-blur-md bg-opacity-45 flex justify-center items-center">
            { props.children }
        </div>
    )
}