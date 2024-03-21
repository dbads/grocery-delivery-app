import { ObjectId } from "mongodb";

function stringIdToObjectId(id: string) {
  const objectId = new ObjectId(id);
  return objectId;
}

export { stringIdToObjectId };