import { PdfUploadList } from "@/components/modules/pdf-uploadManagement/PdfUploadList";
import { UploadPdfDialog } from "@/components/modules/pdf-uploadManagement/UploadPdfDialog";
import { getAllPdfUploads } from "@/service/pdf-upload/pdfUpload.service";
import { getAllSubjects } from "@/service/subject/subject.service";

export const dynamic = "force-dynamic";

export default async function AdminPdfUploadsPage() {
  const [uploadsRes, subjectsRes] = await Promise.all([
    getAllPdfUploads(),
    getAllSubjects({ isActive: true, limit: 100 }),
  ]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">PDF Uploads</h1>
          <p className="text-muted-foreground">
            Upload question papers and extract MCQs with AI
          </p>
        </div>
        <UploadPdfDialog subjects={subjectsRes.data || []} />
      </div>

      <PdfUploadList initialData={uploadsRes.data || []} />
    </div>
  );
}