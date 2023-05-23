function FormButton({ variant, children, ...rest }) {
    const defaultVariant = 'bg-orange-500 hover:bg-orange-700 text-xl text-white font-bold py-2 px-4 rounded'
    const buttonVariants = {
        enabled: defaultVariant,
        disabled: `${defaultVariant} opacity-50 cursor-not-allowed`,
    }

    return (
        <button className={`${buttonVariants[variant]} ...`} {...rest}>
            {children}
        </button>
    )
}

export default FormButton
