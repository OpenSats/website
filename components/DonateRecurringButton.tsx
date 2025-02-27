import CustomLink from './Link'

export default function DonateRecurringButton() {
  return (
    <div className="mb-10 mt-12 flex justify-center">
      <CustomLink
        href="https://checkout.opensats.org/b/4gwg1bbvW6Li0ww7st"
        className="my-15 rounded border border-orange-500 bg-transparent px-8 py-4 text-lg font-semibold no-underline hover:bg-orange-100"
      >
        Give Monthly 🧡
      </CustomLink>
    </div>
  )
}
