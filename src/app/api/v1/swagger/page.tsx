import {SwaggerDocs} from "@/components/swagger-docs";
import { SwaggerService } from "@/services/swagger.service";

export default async function IndexPage() {
  const spec = await SwaggerService.instance.getApiV1Docs();
  return (
    <section className="container">
      <SwaggerDocs spec={spec} />
    </section>
  );
}
