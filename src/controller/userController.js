import userModel from "../dao/models/usersModel.js";

export const changeUserRole = (req, res) => {
    try {
      const userId = req.params.uid;
      const updatedRole = req.body.role;
  
      if (["user", "premium"].includes(updatedRole)) {
        const updateUser = userModel.findByIdAndUpdate(
          userId,
          { userRole: updatedRole },
          { new: true }
        );
  
        if (updateUser) {
          res.status(200).json(updateUser);
        } else {
          res.status(404).send("usuario no encontrado");
        }
      }else{
        res.status(400).send("rol no fue aceptado, eliga entre las siguientes opciones: user o premium");
      }
    } catch (error) {
      console.log(error.message)
    }
  }