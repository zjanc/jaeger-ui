import * as React from 'react';
import { Dispatch } from "react";
import { connect } from "react-redux";
import { ReduxState } from "../../../types";
// @ts-ignore
import store from 'store';
// @ts-ignore
import { Field, formValueSelector, reduxForm } from 'redux-form';
import { Col, Row } from 'antd';
import { trackSelectService } from '../../Monitor/ServicesView/index.track';
import reduxFormFieldAdapter from '../../../utils/redux-form-field-adapter';
import VirtSelect from '../../common/VirtSelect';

type StateType = {};
type TReduxProps = {
  services: string[];
  servicesLoading: boolean;
  operationsForService: Record<string, string[]>;
  selectedService: string;
  selectedOperation: string;
};
type TDispatchProps = {};

type TProps = TReduxProps & TDispatchProps;

const analysisFormSelector = formValueSelector('analysisForm');

const AdaptedVirtualSelect = reduxFormFieldAdapter({
  AntInputComponent: VirtSelect,
  onChangeAdapter: option => (option ? (option as any).value : null),
})

export class CriticalPathViewImpl extends React.PureComponent<TProps, StateType> {
  constructor(props: TProps) {
    super(props);
  }

  fetchAnalysis() {
  }

  getSelectedService() {
    const { selectedService, services } = this.props;
    return selectedService || services[0];
  }

  getSelectedOperation() {
    const { selectedOperation, selectedService, operationsForService } = this.props;
    return selectedOperation || operationsForService[selectedService]
  }

  render() {
    const { services, servicesLoading, selectedService } = this.props;
    return (
      <>
        <div className="critical-path-container">
          <Row>
            <Col span={16}>
              <h1>Test Critical Path Page</h1>
            </Col>
          </Row>

          <Row>
            <Col span={6}>
              <h2 className="service-selector-header">Choose service</h2>
              <Field
                onChange={(e: Event, newValue: string) => trackSelectService(newValue)}
                name="service"
                component={AdaptedVirtualSelect}
                placeholder="Select A Service"
                props={{
                  className: 'select-a-service-input',
                  value: this.getSelectedService(),
                  disabled: servicesLoading,
                  clearable: false,
                  options: services.map((s: string) => ({ label: s, value: s })),
                  required: true,
                }}
              />
            </Col>
          </Row>
        </div>
      </>
    )
  }
}

export function mapStateToProps(state: ReduxState): TReduxProps {
  const { services } = state;
  return {
    services: services.services || [],
    servicesLoading: services.loading,
    operationsForService: services.operationsForService,
    selectedService: analysisFormSelector(state, 'service') || store.get('lastAnalysisService'),
    selectedOperation: analysisFormSelector(state, 'operation') || store.get('lastAnalysisOperation'),
  }
}

export function mapDispatchToProps(dispatch: Dispatch<ReduxState>): TDispatchProps {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  reduxForm({
    form: 'analysisForm',
  })(CriticalPathViewImpl)
)