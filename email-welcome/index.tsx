import { Resend } from "resend";
import { seller } from "@/types/sellerindex";
import WelcomeEmail from "./welcome-email";
import { EMAIL_FROM } from "@/lib/constants";


const resend = new Resend(process.env.RESEND_API_KEY as string);

export const sendCongratulatoryEmail = async ({
 seller
}: {
  seller : seller;
}) => {
  const res = await resend.emails.send({
    from: EMAIL_FROM,
    to: seller.email,
    subject: "🎉 Congratulations on setting up your shop",
    react: <WelcomeEmail  seller={seller} />,
  });
  console.log(res);
};