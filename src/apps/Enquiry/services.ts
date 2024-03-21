import { constants } from "../../common";
import { User } from "../user";
import { Enquiry, EnquiryI  } from "./model";

async function getEnquiriesByAgent(agentId: string) {

  // if agent is an admin then send all the onboardings
  const agent = await User.findOne({ _id: agentId }).lean();

  if (!agent) throw new Error(`[Error] agent not found`);

  const enquiryFilter: { isDeleted: boolean, agent?: string} = { isDeleted: false };
  if (agent.userType !== constants.UserType.Admin) {
    enquiryFilter.agent = agentId;
  }

  const enquiries = await Enquiry.find(enquiryFilter).sort({ createdAt: -1 });
  return enquiries;
}

async function getEnquiry(enquiryId: string) {
  const enquiry = await Enquiry.find({ _id: enquiryId, isDeleted: false });
  return enquiry;
}

async function createEnquiry(EnquiryData: EnquiryI) {
  let enquiry = new Enquiry({
    ...EnquiryData,
  });

  enquiry = await enquiry.save();
  return enquiry;
}

async function updateEnquiry(
  enquiryId: string,
  enquiryData: EnquiryI
) {
  // can put validations here

  const updatedProfile = await Enquiry.findOneAndUpdate(
    { _id: enquiryId },
    { ...enquiryData, random: 'random' }
  );

  return updatedProfile;
}

async function deleteEnquiry(enquiryId: string) {
  // can put validations here
    
  await Enquiry.findOneAndDelete({ _id: enquiryId });
    
  return { message: "Enquiry successfully deleted" };
}


export { 
  getEnquiriesByAgent,
  getEnquiry,
  createEnquiry,
  updateEnquiry,
  deleteEnquiry
};
