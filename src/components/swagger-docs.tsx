'use client';

import React from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

type SwaggerDocsProps = {
  spec: Record<string, any>,
};

export const SwaggerDocs: React.FC<SwaggerDocsProps> = ({ spec }) => {
  return <SwaggerUI spec={spec} />;
}
