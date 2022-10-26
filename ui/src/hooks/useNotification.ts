import { useToast } from "@chakra-ui/react";
import React from "react";

const useNotification = () => {
  const toast = useToast({
    position: "top",
    duration: 3500,
    variant: "subtle",
  });

  const showError = (message: string) =>
    toast({
      status: "error",
      title: "The transaction failed",
      description: message,
    });

  const showSuccess = (message: string) =>
    toast({
      status: "success",
      title: "The transaction was successfull!",
      description: message,
    });

  return {
    showError,
    showSuccess,
  };
};

export default useNotification;
