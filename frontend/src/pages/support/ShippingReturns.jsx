// src/pages/support/ShippingReturns.jsx
import PageMeta from "../../components/shared/PageMeta";

export default function ShippingReturns() {
  return (
    <>
      <PageMeta title="Shipping & Returns Policy" />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 prose prose-sm max-w-none">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-6">
          Shipping & Returns
        </h1>
        {[
          {
            title: "🚚 Delivery",
            body: `We ship nationwide via TCS and Leopard Courier.
              Standard delivery: 3-7 business days.
              Express delivery available on request.
              Free shipping on orders above Rs. 2,999.
              Flat Rs. 200 shipping on orders below Rs. 2,999.`,
          },
          {
            title: "💵 Cash on Delivery",
            body: `COD is available on all orders across Pakistan.
              Payment is collected by the courier at the time of delivery.
              No advance payment required.`,
          },
          {
            title: "🔄 Return Policy",
            body: `Returns accepted within 7 days of delivery.
              Item must be unused, unwashed, and in original packaging.
              To request a return, go to My Orders > Select Order > Request Return.
              Approved returns are refunded via bank transfer within 3-5 business days.`,
          },
          {
            title: "📞 Contact",
            body: `WhatsApp: 03XX-XXXXXXX (9AM - 9PM, Mon-Sat)
              Email: hello@kaprastore.com`,
          },
        ].map(({ title, body }) => (
          <div key={title} className="bg-white rounded-2xl border border-gray-100
                                      shadow-sm p-5 mb-4">
            <h2 className="font-bold text-gray-900 text-base mb-2">{title}</h2>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
              {body}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}