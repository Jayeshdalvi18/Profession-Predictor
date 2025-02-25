import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
  } from '@react-email/components';
  import * as React from 'react';
  interface VerificationEmailProps {
    username: string;
    otp: string;
  }
  
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  
  export const VerficationEmail = ({ username, otp }: VerificationEmailProps) => (
    <Html>
      <Head />
      <Preview>Welcome to Our Platform! Verify your account.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome, {username}!</Heading>
          <Text style={text}>
            We&apos;re thrilled to have you on board. To get started, please verify your account using the OTP below:
          </Text>
          <Section style={otpContainer}>
            <Text style={otpCode}>{otp}</Text>
          </Section>
          <Text style={text}>
            This OTP is valid for 10 minutes. Please enter it on the verification page to activate your account.
          </Text>
          <Section style={buttonContainer}>
            <Button
              style={button}
              href={`${baseUrl}/verify/${username}`}
            >
              Verify Account
            </Button>
          </Section>
          <Text style={text}>
            If you didn&apos;t request this email, please ignore it or contact our support team if you have any concerns.
          </Text>
          <Text style={footer}>
            Best regards,<br />
            The Your Platform Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
  
  export default VerficationEmail;
  
  // Styles
  const main = {
    backgroundColor: '#ffffff',
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  };
  
  const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    width: '580px',
  };
  
  const h1 = {
    color: '#333',
    fontSize: '24px',
    fontWeight: 'bold',
    paddingBottom: '20px',
  };
  
  const text = {
    color: '#333',
    fontSize: '16px',
    lineHeight: '26px',
  };
  
  const buttonContainer = {
    padding: '27px 0 27px',
  };
  
  const button = {
    backgroundColor: '#0070f3',
    borderRadius: '3px',
    color: '#fff',
    fontSize: '16px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    width: '170px',
  };
  
  const footer = {
    color: '#898989',
    fontSize: '14px',
    lineHeight: '24px',
    marginTop: '20px',
  };
  
  const otpContainer = {
    padding: '20px 0',
    textAlign: 'center' as const,
  };
  
  const otpCode = {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#0070f3',
    letterSpacing: '4px',
  };
  
  