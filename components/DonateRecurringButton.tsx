import CustomLink from './Link'

export default function DonateRecurringButton() {
  return (
    <div className="mb-5 mt-10 flex justify-center">
      <CustomLink
        href="https://checkout.opensats.org/b/9AQbKVgQgb1ybba5kk"
        className="my-15 rounded border border-orange-500 bg-transparent px-8 py-4 text-lg font-semibold text-orange-500 no-underline hover:border-transparent hover:bg-orange-500 hover:text-white"
      >
        Donate Monthly 🧡
      </CustomLink>
    </div>
  )
}
