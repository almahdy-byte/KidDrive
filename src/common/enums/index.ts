export enum Role {
    Admin = "admin",
    Driver = "driver",
    Parent = "parent",
}

export enum Gender {
    Male = "male",
    Female = "female",
}
export enum Status {
    ACCEPTED = "accepted subscription",
    REJECTED = 'rejected subscription',
    CANCELED = 'canceled',
    PENDING = 'waiting for confirmation'
}

export enum Subject{
    ConfirmEmail = 'confirmEmail',
    ForgetPassword = 'forgetPassword',
}

export enum ApplicationStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected'
}

export enum TokenType{
    Access = 'access',
    Refresh = 'refresh',
}

export enum GradeNameArabic{
      Four = "رابعة ابتدائي",
      Five = "خامسة ابتدائي",
      Six = "سادسة ابتدائي",
      Seven = "اولى اعدادي",
      Eight = "تانية اعدادي",
      Nine = "تالتة اعدادي" 
}

export enum GradeNameEnglish{
    Four = "Fourth Primary",
    Five = "Fifth Primary",
    Six = "Sixth Primary",
    Seven = "First Secondary",
    Eight = "Second Secondary",
    Nine = "Third Secondary"
}


export enum SubscriptionType{
    MONTHLY = 'monthly',
    TERM = 'term',
}

// export const FileType={
//     IMAGE:['image/apng' , 'image/jpeg' , 'image/png'],
//     VIDEO:[],
//     PDF:['application/pdf']
// }
// Object.freeze(FileType)
