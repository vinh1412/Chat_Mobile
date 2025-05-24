export const getFileIcon = (fileName) => {
    const extension = fileName?.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return "file-pdf";

      case "doc":
      case "docx":
        return "file-word";

      case "xls":
      case "xlsx":
        return "file-excel";

      case "ppt":
      case "pptx":
        return "file-powerpoint"; // Icon cho PowerPoint

      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "file-image"; // Icon cho hình ảnh

      case "zip":       
      case "rar":
      case "tar":
      case "7z":
        return "file-archive"; // Icon cho file nén

      case "txt":
        return "file-alt"; // Icon cho file văn bản

      case "mp3":
      case "wav":
      case "ogg":
        return "file-audio"; // Icon cho file âm thanh

      case "mp4":
      case "mov":
      case "avi":
        return "file-video"; // Icon cho file video

      case "js":
      case "jsx":
      case "ts":
      case "tsx":
      case "html":
      case "css":
      case "java":
      case "py":
      case "php":
      case "c":
      case "cpp":
      case "cs":
      case "go":
      case "swift":
      case "rb":
        return "file-code"; // Icon cho file mã nguồn

      case "json":
        return "file-code"; // Icon cho file JSON
      case "csv":
        return "file-csv";

      default:
        return "file";
    }
  };