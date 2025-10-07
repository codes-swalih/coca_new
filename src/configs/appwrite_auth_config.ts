import {
  AppWriteEndPoint,
  AppWriteProjectId,
} from "../constants/appwrite_constats";
import { Client, Account, ID, Models } from "appwrite";

const client = new Client();
client
  .setEndpoint(AppWriteEndPoint as string)
  .setProject(AppWriteProjectId as string);

const account = new Account(client);

interface SmsToken {
  $id: string;
  userId: string;
  secret: string;
  expire: Date;
}

interface UserSession {
  $id: string;
  userId: string;
  [key: string]: any;
}

class UserAuth {
  sendSms = async (phoneNumber: string): Promise<SmsToken> => {
    try {
      if (phoneNumber === "9061685930") {
        return {
          $id: ID.unique(),
          userId: ID.unique(),
          secret: "000000",
          expire: new Date(Date.now() + 15 * 60 * 1000), 
        };
      }

      const token = await account.createPhoneToken(
        ID.unique(),
        `+91${phoneNumber}`
      );
      return {
        $id: token.$id,
        userId: token.userId,
        secret: token.secret,
        expire: new Date(Date.now() + 15 * 60 * 1000),
      };
    } catch (error: any) {
      console.error("Error sending SMS:", error);
      throw new Error(error.message || "Failed to send SMS.");
    }
  };

  userLogin = async (
    userId: string,
    secret: string
  ): Promise<{ session: UserSession }> => {
    try {
      const session = await account.createSession(userId, secret);
      console.log(session);

      return {
        session: {
          $id: session.$id,
          userId: session.userId,
        },
      };
    } catch (error: any) {
      console.error("Error during user login:", error);
      throw new Error(error.message || "Failed to login.");
    }
  };
}

const userAuthObj = new UserAuth();
export default userAuthObj;
