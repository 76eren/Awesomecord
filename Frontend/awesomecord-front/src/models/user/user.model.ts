export interface UserModel {
    id: string;
    displayName: string;
    userHandle: string;
    bio: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    sentFriendRequests: string[];
    receivedFriendRequests: string[];
    friends: string[];
}